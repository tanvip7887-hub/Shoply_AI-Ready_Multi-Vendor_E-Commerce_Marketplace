import prisma from "../../config/prisma.js";
import logger from "../../utils/logger.js";
import { restockOnCancel, restockOnReturn } from "../inventory/inventory.service.js";
import {
  createNotification,
  sendReturnSubmittedEmail,
  sendSellerReturnAlertEmail,
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
  sendRefundInitiatedEmail,
  sendRefundCompletedEmail,
} from "../notification/notification.service.js";

// Helper: Calculate return eligibility for an OrderItem
export const checkReturnEligibility = (orderItem, order) => {
  if (!order || order.orderStatus !== "DELIVERED") {
    return { isEligible: false, reason: "Order has not been delivered yet" };
  }

  if (orderItem.returnRequest && orderItem.returnRequest.status !== "CANCELLED") {
    return {
      isEligible: false,
      reason: `Return request already exists (${orderItem.returnRequest.status})`,
      returnRequest: orderItem.returnRequest,
    };
  }

  // Calculate 7-day return window from delivery date
  const deliveryDate = order.shipment?.deliveredAt || order.updatedAt || order.createdAt;
  const returnDeadline = new Date(new Date(deliveryDate).getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  if (now > returnDeadline) {
    return {
      isEligible: false,
      reason: "7-day return window has expired for this item",
      deliveredAt: deliveryDate,
      returnDeadline,
    };
  }

  return {
    isEligible: true,
    deliveredAt: deliveryDate,
    returnDeadline,
  };
};

// ---- Customer Operations ----

export const createReturnRequest = async (customerId, { orderItemId, reason, comment }) => {
  const item = await prisma.orderItem.findUnique({
    where: { id: Number(orderItemId) },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          shipment: true,
        },
      },
      product: {
        include: {
          seller: { include: { user: { select: { id: true, email: true } } } },
        },
      },
      returnRequest: true,
    },
  });

  if (!item) {
    const err = new Error("Order item not found");
    err.statusCode = 404;
    throw err;
  }

  // Verify ownership
  if (item.order.userId !== customerId) {
    const err = new Error("You are not authorized to return this item");
    err.statusCode = 403;
    throw err;
  }

  // Verify eligibility backend-side
  const eligibility = checkReturnEligibility(item, item.order);
  if (!eligibility.isEligible) {
    const err = new Error(eligibility.reason);
    err.statusCode = 400;
    throw err;
  }

  if (item.returnRequest && item.returnRequest.status === "CANCELLED") {
    await prisma.returnRequest.delete({ where: { id: item.returnRequest.id } });
  }

  // Refund amount calculated from actual OrderItem subtotal
  const refundAmount = Number(item.subtotal);

  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderItemId: item.id,
      orderId: item.orderId,
      customerId,
      sellerId: item.product.sellerId,
      productId: item.productId,
      reason,
      comment: comment ? comment.trim() : null,
      refundAmount,
      status: "RETURN_REQUESTED",
    },
    include: {
      product: { select: { id: true, name: true } },
      orderItem: true,
      order: { select: { id: true, paymentMethod: true } },
    },
  });

  // Notifications
  createNotification(
    customerId,
    "Return Request Submitted",
    `Your return request for "${item.productName}" (Order #${item.orderId}) has been submitted.`
  ).catch(() => {});

  if (item.product.seller && item.product.seller.user) {
    createNotification(
      item.product.seller.userId,
      "New Return Request",
      `New return request for "${item.productName}" (Order #${item.orderId}).`
    ).catch(() => {});

    sendSellerReturnAlertEmail(item.product.seller.user.email, returnRequest).catch((err) => {
      logger.error(`Failed to send seller return alert email for return #${returnRequest.id}`);
    });
  }

  sendReturnSubmittedEmail(item.order.user.email, returnRequest).catch((err) => {
    logger.error(`Failed to send return submitted email for return #${returnRequest.id}`);
  });

  return returnRequest;
};

export const getMyReturns = async (customerId) => {
  return prisma.returnRequest.findMany({
    where: { customerId },
    include: {
      orderItem: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      order: { select: { id: true, createdAt: true, paymentMethod: true } },
      refund: true,
      returnShipment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getReturnByIdForCustomer = async (customerId, returnId) => {
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
    include: {
      orderItem: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      order: { select: { id: true, createdAt: true, paymentMethod: true, shippingAddress: true } },
      refund: true,
      returnShipment: true,
    },
  });

  if (!returnReq || returnReq.customerId !== customerId) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  return returnReq;
};

export const cancelReturnRequest = async (customerId, returnId) => {
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
  });

  if (!returnReq || returnReq.customerId !== customerId) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  if (!["RETURN_REQUESTED", "RETURN_APPROVED"].includes(returnReq.status)) {
    const err = new Error(`Cannot cancel return request with status ${returnReq.status}`);
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.returnRequest.update({
    where: { id: Number(returnId) },
    data: { status: "CANCELLED" },
  });

  await prisma.returnShipment.deleteMany({ where: { returnRequestId: Number(returnId) } });

  return updated;
};

// ---- Seller Operations ----

const getSellerOrThrow = async (userId) => {
  const seller = await prisma.seller.findUnique({ where: { userId } });
  if (!seller) {
    const err = new Error("Seller profile not found");
    err.statusCode = 403;
    throw err;
  }
  return seller;
};

export const getSellerReturns = async (userId, { status } = {}) => {
  const seller = await getSellerOrThrow(userId);
  const where = { sellerId: seller.id };
  if (status && status !== "ALL") {
    where.status = status;
  }

  return prisma.returnRequest.findMany({
    where,
    include: {
      orderItem: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      order: { select: { id: true, createdAt: true, paymentMethod: true } },
      refund: true,
      returnShipment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getSellerReturnById = async (userId, returnId) => {
  const seller = await getSellerOrThrow(userId);
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
    include: {
      orderItem: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      order: { select: { id: true, createdAt: true, paymentMethod: true, shippingAddress: true } },
      refund: true,
      returnShipment: true,
    },
  });

  if (!returnReq || returnReq.sellerId !== seller.id) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  return returnReq;
};

export const approveReturnBySeller = async (userId, returnId) => {
  const seller = await getSellerOrThrow(userId);
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
    include: {
      customer: { select: { email: true } },
      product: { select: { name: true } },
      order: { select: { paymentMethod: true } },
    },
  });

  if (!returnReq || returnReq.sellerId !== seller.id) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  if (returnReq.status !== "RETURN_REQUESTED") {
    const err = new Error(`Cannot approve return with current status ${returnReq.status}`);
    err.statusCode = 400;
    throw err;
  }

  const trackingNumber = `TRK-RET-${returnId}-${Math.floor(1000 + Math.random() * 9000)}`;

  const updatedReturn = await prisma.$transaction(async (tx) => {
    const updated = await tx.returnRequest.update({
      where: { id: Number(returnId) },
      data: {
        status: "PICKUP_SCHEDULED",
        approvedAt: new Date(),
        pickupScheduledAt: new Date(),
      },
      include: {
        product: { select: { name: true } },
        customer: { select: { email: true } },
        order: { select: { id: true, paymentMethod: true } },
      },
    });

    await tx.returnShipment.create({
      data: {
        returnRequestId: Number(returnId),
        trackingNumber,
        shipmentStatus: "PICKUP_CREATED",
      },
    });

    await tx.refund.create({
      data: {
        returnRequestId: Number(returnId),
        amount: returnReq.refundAmount,
        status: "PENDING",
        paymentMethod: returnReq.order.paymentMethod,
      },
    });

    return updated;
  });

  createNotification(
    returnReq.customerId,
    "Return Approved",
    `Your return request for "${returnReq.product?.name}" has been approved. Return pickup is being scheduled.`
  ).catch(() => {});

  sendReturnApprovedEmail(returnReq.customer.email, updatedReturn).catch((err) => {
    logger.error(`Failed to send return approved email for return #${returnId}`);
  });

  return updatedReturn;
};

export const rejectReturnBySeller = async (userId, returnId, rejectionReason) => {
  const seller = await getSellerOrThrow(userId);
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
    include: { customer: { select: { email: true } } },
  });

  if (!returnReq || returnReq.sellerId !== seller.id) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  if (returnReq.status !== "RETURN_REQUESTED") {
    const err = new Error(`Cannot reject return with current status ${returnReq.status}`);
    err.statusCode = 400;
    throw err;
  }

  if (!rejectionReason || !rejectionReason.trim()) {
    const err = new Error("Rejection reason is required");
    err.statusCode = 400;
    throw err;
  }

  const updatedReturn = await prisma.returnRequest.update({
    where: { id: Number(returnId) },
    data: {
      status: "RETURN_REJECTED",
      rejectionReason: rejectionReason.trim(),
      rejectedAt: new Date(),
    },
    include: { product: { select: { name: true } } },
  });

  createNotification(
    returnReq.customerId,
    "Return Rejected",
    `Your return request for order #${returnReq.orderId} was rejected. Reason: ${rejectionReason}`
  ).catch(() => {});

  sendReturnRejectedEmail(returnReq.customer.email, updatedReturn, rejectionReason).catch((err) => {
    logger.error(`Failed to send return rejected email for return #${returnId}`);
  });

  return updatedReturn;
};

export const inspectReturnBySeller = async (userId, returnId) => {
  const seller = await getSellerOrThrow(userId);
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
    include: { customer: { select: { email: true } }, refund: true },
  });

  if (!returnReq || returnReq.sellerId !== seller.id) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  if (returnReq.status !== "RECEIVED") {
    const err = new Error(`Inspection requires returned item to be RECEIVED. Current status: ${returnReq.status}`);
    err.statusCode = 400;
    throw err;
  }

  const updatedReturn = await prisma.$transaction(async (tx) => {
    const updated = await tx.returnRequest.update({
      where: { id: Number(returnId) },
      data: {
        status: "REFUND_INITIATED",
        inspectedAt: new Date(),
      },
      include: { product: { select: { name: true } } },
    });

    if (returnReq.refund) {
      await tx.refund.update({
        where: { id: returnReq.refund.id },
        data: {
          status: "INITIATED",
          initiatedAt: new Date(),
        },
      });
    }

    return updated;
  });

  const updatedRefund = await prisma.refund.findUnique({ where: { returnRequestId: Number(returnId) } });

  createNotification(
    returnReq.customerId,
    "Refund Initiated",
    `Inspection completed for order #${returnReq.orderId}. Your refund of ₹${returnReq.refundAmount} has been initiated.`
  ).catch(() => {});

  sendRefundInitiatedEmail(returnReq.customer.email, updatedReturn, updatedRefund || { amount: returnReq.refundAmount, paymentMethod: returnReq.order.paymentMethod }).catch(() => {});

  return updatedReturn;
};

export const processRefundBySellerOrAdmin = async (userId, returnId, role = "SELLER") => {
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: Number(returnId) },
    include: { customer: { select: { email: true } }, refund: true, orderItem: true },
  });

  if (!returnReq) {
    const err = new Error("Return request not found");
    err.statusCode = 404;
    throw err;
  }

  if (role === "SELLER") {
    const seller = await getSellerOrThrow(userId);
    if (returnReq.sellerId !== seller.id) {
      const err = new Error("Unauthorized to process refund for this seller's return");
      err.statusCode = 403;
      throw err;
    }
  }

  if (!["REFUND_INITIATED", "INSPECTION"].includes(returnReq.status)) {
    const err = new Error(`Cannot complete refund for return with status ${returnReq.status}`);
    err.statusCode = 400;
    throw err;
  }

  const txnRef = `REFUND_SIM_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

  const updatedReturn = await prisma.$transaction(async (tx) => {
    const updated = await tx.returnRequest.update({
      where: { id: Number(returnId) },
      data: {
        status: "REFUNDED",
        completedAt: new Date(),
      },
      include: { product: { select: { name: true } }, refund: true },
    });

    if (returnReq.refund) {
      await tx.refund.update({
        where: { id: returnReq.refund.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          transactionReference: txnRef,
        },
      });
    }

    // Inventory restock on accepted returned item
    await restockOnReturn(returnReq.productId, returnReq.orderItem.quantity, userId, tx).catch(() => {});

    return updated;
  });

  const updatedRefund = await prisma.refund.findUnique({ where: { returnRequestId: Number(returnId) } });

  createNotification(
    returnReq.customerId,
    "Refund Completed",
    `Refund of ₹${returnReq.refundAmount} for order #${returnReq.orderId} has been successfully completed!`
  ).catch(() => {});

  sendRefundCompletedEmail(returnReq.customer.email, updatedReturn, updatedRefund || { amount: returnReq.refundAmount, paymentMethod: "COD" }).catch(() => {});

  return updatedReturn;
};

// ---- Delivery Agent Return Pickup Operations ----

export const getAvailableReturnPickups = async () => {
  return prisma.returnShipment.findMany({
    where: {
      shipmentStatus: "PICKUP_CREATED",
      deliveryAgentId: null,
    },
    include: {
      returnRequest: {
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: {
              id: true,
              businessName: true,
              ownerName: true,
              mobileNumber: true,
              sellerAddress: true,
            },
          },
          product: { select: { id: true, name: true, images: { take: 1 } } },
          orderItem: true,
          order: { select: { id: true, shippingAddress: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const acceptReturnShipment = async (agentUserId, shipmentId) => {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.returnShipment.findUnique({
      where: { id: Number(shipmentId) },
    });

    if (!shipment) {
      const err = new Error("Return shipment not found");
      err.statusCode = 404;
      throw err;
    }

    if (shipment.deliveryAgentId !== null || shipment.shipmentStatus !== "PICKUP_CREATED") {
      const err = new Error("Return pickup has already been claimed or is unavailable");
      err.statusCode = 409;
      throw err;
    }

    return tx.returnShipment.update({
      where: { id: Number(shipmentId) },
      data: { deliveryAgentId: agentUserId },
      include: { returnRequest: true },
    });
  });
};

export const getMyReturnShipments = async (agentUserId) => {
  return prisma.returnShipment.findMany({
    where: {
      deliveryAgentId: agentUserId,
    },
    include: {
      returnRequest: {
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: {
              id: true,
              businessName: true,
              ownerName: true,
              mobileNumber: true,
              sellerAddress: true,
            },
          },
          product: { select: { id: true, name: true, images: { take: 1 } } },
          orderItem: true,
          order: { select: { id: true, shippingAddress: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateReturnShipmentStatus = async (agentUserId, shipmentId, newStatus) => {
  const shipment = await prisma.returnShipment.findUnique({
    where: { id: Number(shipmentId) },
    include: { returnRequest: true },
  });

  if (!shipment) {
    const err = new Error("Return shipment not found");
    err.statusCode = 404;
    throw err;
  }

  if (shipment.deliveryAgentId !== agentUserId) {
    const err = new Error("You are not authorized to update this return shipment");
    err.statusCode = 403;
    throw err;
  }

  const ALLOWED_TRANSITIONS = {
    PICKUP_CREATED: ["PICKED_UP"],
    PICKED_UP: ["DELIVERED"],
  };

  const allowedNext = ALLOWED_TRANSITIONS[shipment.shipmentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    const err = new Error(`Invalid status transition from ${shipment.shipmentStatus} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  const updateData = { shipmentStatus: newStatus };
  if (newStatus === "PICKED_UP") {
    updateData.pickedUpAt = new Date();
  }
  if (newStatus === "DELIVERED") {
    updateData.deliveredAt = new Date();
  }

  return prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.returnShipment.update({
      where: { id: Number(shipmentId) },
      data: updateData,
    });

    if (newStatus === "PICKED_UP") {
      await tx.returnRequest.update({
        where: { id: shipment.returnRequestId },
        data: { status: "PICKED_UP", pickedUpAt: new Date() },
      });
      createNotification(shipment.returnRequest.customerId, "Item Picked Up", `Your returned item for order #${shipment.returnRequest.orderId} has been picked up.`).catch(() => {});
    } else if (newStatus === "DELIVERED") {
      await tx.returnRequest.update({
        where: { id: shipment.returnRequestId },
        data: { status: "RECEIVED", receivedAt: new Date() },
      });
      createNotification(shipment.returnRequest.customerId, "Returned Item Received", `Your returned item for order #${shipment.returnRequest.orderId} has been delivered to the seller/hub for inspection.`).catch(() => {});
      createNotification(shipment.returnRequest.sellerId, "Returned Item Received", `Returned item for order #${shipment.returnRequest.orderId} has been received. Please perform inspection.`).catch(() => {});
    }

    return updatedShipment;
  });
};

// ---- Admin Operations ----

export const getAllReturnsForAdmin = async ({ status } = {}) => {
  const where = status && status !== "ALL" ? { status } : {};
  return prisma.returnRequest.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, businessName: true } },
      product: { select: { id: true, name: true } },
      refund: true,
      returnShipment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllRefundsForAdmin = async ({ status } = {}) => {
  const where = status && status !== "ALL" ? { status } : {};
  return prisma.refund.findMany({
    where,
    include: {
      returnRequest: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, businessName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
