import prisma from "../../config/prisma.js";
import { deductStockForOrder, restockOnCancel } from "../inventory/index.js";
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendSellerNewOrderEmail,
  createNotification,
} from "../notification/notification.service.js";
import logger from "../../utils/logger.js";

const getUserAddressOrThrow = async (userId, addressId) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    const err = new Error("Address not found");
    err.statusCode = 404;
    throw err;
  }
  return address;
};

const snapshotAddress = (address) => ({
  fullName: address.fullName,
  phone: address.phone,
  addressLine1: address.addressLine1,
  addressLine2: address.addressLine2,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  type: address.type,
});

export const createOrder = async (userId, { addressId, paymentMethod = "COD" }) => {
  const address = await getUserAddressOrThrow(userId, addressId);

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    const err = new Error("Your cart is empty");
    err.statusCode = 400;
    throw err;
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { include: { inventory: true, seller: true } } },
  });

  if (cartItems.length === 0) {
    const err = new Error("Your cart is empty");
    err.statusCode = 400;
    throw err;
  }

  // Split cart items by seller — one Order per seller, matching how
  // real multi-vendor marketplaces checkout a mixed-seller cart.
  const itemsBySeller = cartItems.reduce((acc, item) => {
    const sellerId = item.product.sellerId;
    if (!acc[sellerId]) acc[sellerId] = [];
    acc[sellerId].push(item);
    return acc;
  }, {});

  const addressSnapshot = snapshotAddress(address);

  const createdOrders = await prisma.$transaction(async (tx) => {
    // Re-validate everything fresh at order time — stock/active status may
    // have changed since items were added to cart.
    for (const item of cartItems) {
      if (!item.product.isActive || item.product.isDeleted || item.product.approvalStatus !== "APPROVED") {
        const err = new Error(`"${item.product.name}" is no longer available`);
        err.statusCode = 409;
        throw err;
      }
      if (item.product.seller && item.product.seller.status !== "VERIFIED") {
        const err = new Error(`"${item.product.name}" cannot be purchased at this time`);
        err.statusCode = 409;
        throw err;
      }
      const inv = item.product.inventory;
      const available = inv ? inv.stock - inv.reservedStock : 0;
      if (available < item.quantity) {
        const err = new Error(`Only ${available} unit(s) of "${item.product.name}" available`);
        err.statusCode = 409;
        throw err;
      }
    }

    const orders = [];

    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      let rawSubtotal = 0;
      let effectiveSubtotal = 0;
      for (const item of items) {
        const originalPrice = Number(item.product.price);
        const hasDiscount = item.product.discountPrice && Number(item.product.discountPrice) < originalPrice;
        const unitPrice = hasDiscount ? Number(item.product.discountPrice) : originalPrice;
        rawSubtotal += originalPrice * item.quantity;
        effectiveSubtotal += unitPrice * item.quantity;
      }
      
      const discount = rawSubtotal - effectiveSubtotal;
      const shippingCharge = 0;
      const totalAmount = effectiveSubtotal + shippingCharge;

      const order = await tx.order.create({
        data: {
          userId,
          sellerId: Number(sellerId),
          shippingAddress: addressSnapshot,
          subtotal: effectiveSubtotal,
          shippingCharge,
          discount,
          totalAmount,
          paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          items: {
            create: items.map((item) => {
              const originalPrice = Number(item.product.price);
              const hasDiscount = item.product.discountPrice && Number(item.product.discountPrice) < originalPrice;
              const unitPrice = hasDiscount ? Number(item.product.discountPrice) : originalPrice;
              return {
                productId: item.productId,
                productName: item.product.name,
                price: unitPrice,
                quantity: item.quantity,
                subtotal: unitPrice * item.quantity,
              };
            }),
          },
        },
        include: { items: { include: { product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } } } } },
      });

      for (const item of items) {
        await deductStockForOrder(item.productId, item.quantity, userId, tx);
      }

      orders.push(order);
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return orders;
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Send confirmation email & create in-app notifications
  for (const order of createdOrders) {
    sendOrderConfirmationEmail(user.email, order).catch((err) => {
      logger.error(`Failed to send order confirmation email for order #${order.id}`);
      logger.error(err);
    });

    createNotification(userId, "Order Placed", `Your order #${order.id} has been placed successfully.`).catch((err) => {
      logger.error(`Failed to create order notification for customer #${userId}`);
    });

    prisma.seller.findUnique({ where: { id: order.sellerId }, include: { user: true } }).then((seller) => {
      if (seller) {
        createNotification(seller.userId, "New Order Received", `You received a new order #${order.id}!`).catch(() => {});
        if (seller.user && seller.user.email) {
          sendSellerNewOrderEmail(seller.user.email, order).catch((err) => {
            logger.error(`Failed to send new order email to seller #${seller.id} for order #${order.id}`);
            logger.error(err);
          });
        }
      }
    }).catch(() => {});
  }

  return createdOrders;
};

export const getMyOrders = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: { 
      items: { 
        include: { 
          product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          returnRequest: { include: { refund: true, returnShipment: true } },
        } 
      }, 
      seller: { select: { businessName: true } },
      shipment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getMyOrderById = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      items: { 
        include: { 
          product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          returnRequest: { include: { refund: true, returnShipment: true } },
        } 
      }, 
      seller: { select: { businessName: true } },
      shipment: true,
    },
  });
  if (!order || order.userId !== userId) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }
  return order;
};

export const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true } } },
  });
  if (!order || order.userId !== userId) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  if (!["PENDING", "CONFIRMED"].includes(order.orderStatus)) {
    const err = new Error("This order can no longer be cancelled");
    err.statusCode = 409;
    throw err;
  }

  const cancelledOrder = await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await restockOnCancel(item.productId, item.quantity, userId, tx);
    }
    return tx.order.update({
      where: { id: orderId },
      data: { orderStatus: "CANCELLED" },
      include: { items: true },
    });
  });

  if (order.user && order.user.email) {
    sendOrderCancelledEmail(order.user.email, cancelledOrder).catch((err) => {
      logger.error(`Failed to send order cancellation email for order #${orderId}`);
      logger.error(err);
    });
  }

  return cancelledOrder;
};


// ---- Seller-facing ----

const getSellerProfileOrThrow = async (userId) => {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) {
    const err = new Error("Seller profile not found");
    err.statusCode = 403;
    throw err;
  }
  return seller;
};

export const getSellerOrders = async (userId, { status } = {}) => {
  const seller = await getSellerProfileOrThrow(userId);
  const where = { sellerId: seller.id };
  if (status && status !== "ALL") {
    where.orderStatus = status;
  }
  return prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          returnRequest: { include: { refund: true, returnShipment: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSellerOrderById = async (userId, orderId) => {
  const seller = await getSellerProfileOrThrow(userId);
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } },
          returnRequest: { include: { refund: true, returnShipment: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order || order.sellerId !== seller.id) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }
  return order;
};

const ALLOWED_TRANSITIONS = {
  PENDING: ["CONFIRMED"],
  CONFIRMED: ["PROCESSING"],
  PROCESSING: ["READY_TO_SHIP"],
};

export const updateOrderStatusBySeller = async (userId, orderId, newStatus) => {
  const seller = await getSellerProfileOrThrow(userId);
  const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });

  if (!order || order.sellerId !== seller.id) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    throw err;
  }

  const allowedNext = ALLOWED_TRANSITIONS[order.orderStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    const err = new Error(`Cannot move order from ${order.orderStatus} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  const updatedOrder = await prisma.order.update({ 
    where: { id: Number(orderId) }, 
    data: { orderStatus: newStatus },
    include: { user: { select: { email: true } }, items: true, shipment: true }
  });

  if (newStatus === "READY_TO_SHIP") {
    const existingShipment = await prisma.shipment.findUnique({ where: { orderId: Number(orderId) } });
    if (!existingShipment) {
      const trackingNumber = `TRK-${orderId}-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.shipment.create({
        data: {
          orderId: Number(orderId),
          deliveryAgentId: null,
          trackingNumber,
          shipmentStatus: "PICKUP_CREATED",
        },
      });
    }
  }

  if (newStatus === "SHIPPED") {
    sendOrderShippedEmail(updatedOrder.user.email, updatedOrder).catch((err) => {
      logger.error(`Failed to send order shipped email for order #${orderId}`);
      logger.error(err);
    });
    createNotification(updatedOrder.userId, "Order Shipped", `Your order #${orderId} has been shipped!`).catch(() => {});
  } else if (newStatus === "OUT_FOR_DELIVERY") {
    sendOrderOutForDeliveryEmail(updatedOrder.user.email, updatedOrder).catch((err) => {
      logger.error(`Failed to send order out for delivery email for order #${orderId}`);
      logger.error(err);
    });
    createNotification(updatedOrder.userId, "Out for Delivery", `Your order #${orderId} is out for delivery!`).catch(() => {});
  } else if (newStatus === "DELIVERED") {
    sendOrderDeliveredEmail(updatedOrder.user.email, updatedOrder).catch((err) => {
      logger.error(`Failed to send order delivered email for order #${orderId}`);
      logger.error(err);
    });
    createNotification(updatedOrder.userId, "Order Delivered", `Your order #${orderId} has been delivered!`).catch(() => {});
  }


  return updatedOrder;
};

export const getSellerDashboardStats = async (userId) => {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) {
    const err = new Error("Seller profile not found");
    err.statusCode = 403;
    throw err;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    todaysOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    readyToShipOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalOrders,
    revenueTodayResult,
    revenueTotalResult,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
    sellerOrderIds,
  ] = await prisma.$transaction([
    prisma.order.count({ where: { sellerId: seller.id, createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "PENDING" } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "CONFIRMED" } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "PROCESSING" } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "READY_TO_SHIP" } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "SHIPPED" } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "DELIVERED" } }),
    prisma.order.count({ where: { sellerId: seller.id, orderStatus: "CANCELLED" } }),
    prisma.order.count({ where: { sellerId: seller.id } }),
    prisma.order.aggregate({ where: { sellerId: seller.id, orderStatus: "DELIVERED", createdAt: { gte: startOfToday } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { sellerId: seller.id, orderStatus: "DELIVERED" }, _sum: { totalAmount: true } }),
    prisma.product.count({ where: { sellerId: seller.id, isActive: true, isDeleted: false } }),
    prisma.product.count({ where: { sellerId: seller.id, isDeleted: false, inventory: { stock: { gt: 0, lte: 5 } } } }),
    prisma.product.count({ where: { sellerId: seller.id, isDeleted: false, inventory: { stock: 0 } } }),
    prisma.order.findMany({
      where: { sellerId: seller.id },
      include: { user: { select: { name: true } }, items: { select: { productName: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.findMany({ where: { sellerId: seller.id }, select: { id: true } }),
  ]);

  const orderIds = sellerOrderIds.map((o) => o.id);
  const bestSellingRaw = orderIds.length
    ? await prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        where: { orderId: { in: orderIds } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { subtotal: "desc" } },
        take: 5,
      })
    : [];

  return {
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    readyToShipOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    kpis: {
      todaysOrders,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      readyToShipOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueToday: revenueTodayResult._sum.totalAmount || 0,
      totalRevenue: revenueTotalResult._sum.totalAmount || 0,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
    },
    recentOrders,
    bestSellingProducts: bestSellingRaw.map((p) => ({
      productId: p.productId,
      name: p.productName,
      unitsSold: p._sum.quantity,
      revenue: p._sum.subtotal,
    })),
  };
};