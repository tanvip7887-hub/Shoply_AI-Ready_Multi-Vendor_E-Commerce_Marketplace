import prisma from "../../config/prisma.js";
import { restockOnCancel } from "../inventory/inventory.service.js";
import { sendPaymentConfirmationEmail } from "../notification/notification.service.js";
import logger from "../../utils/logger.js";
import crypto from "crypto";

export const createMockPayment = async (userId, orderIds) => {
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    const err = new Error("Invalid order IDs");
    err.statusCode = 400;
    throw err;
  }

  // Load orders to verify ownership and state
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
  });

  if (orders.length !== orderIds.length) {
    const err = new Error("One or more orders not found");
    err.statusCode = 404;
    throw err;
  }

  let totalAmount = 0;
  for (const order of orders) {
    if (order.userId !== userId) {
      const err = new Error("Unauthorized to pay for these orders");
      err.statusCode = 403;
      throw err;
    }
    if (order.paymentStatus !== "PENDING") {
      const err = new Error(`Order #${order.id} is not pending payment`);
      err.statusCode = 400;
      throw err;
    }
    totalAmount += Number(order.totalAmount);
  }

  // Generate unique payment reference
  const paymentReference = `MOCK_PAY_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  // Update orders with payment reference
  await prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { paymentReference },
  });

  return { paymentReference, totalAmount, orderIds };
};

export const verifyMockPayment = async (userId, paymentReference, status) => {
  if (!paymentReference || !status) {
    const err = new Error("Invalid payment verification payload");
    err.statusCode = 400;
    throw err;
  }

  const orders = await prisma.order.findMany({
    where: { paymentReference },
    include: { items: true },
  });

  if (orders.length === 0) {
    const err = new Error("Payment reference not found");
    err.statusCode = 404;
    throw err;
  }

  // Check ownership
  if (orders[0].userId !== userId) {
    const err = new Error("Unauthorized");
    err.statusCode = 403;
    throw err;
  }

  // Idempotency: If already paid or failed, just return the state safely
  const isAlreadyPaid = orders.every((o) => o.paymentStatus === "PAID");
  const isAlreadyFailed = orders.every((o) => o.paymentStatus === "FAILED");

  if (isAlreadyPaid || isAlreadyFailed) {
    return await fetchEnrichedOrders(orders.map(o => o.id));
  }

  if (status === "SUCCESS") {
    await prisma.order.updateMany({
      where: { paymentReference },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        paidAt: new Date(),
      },
    });

    // Send payment confirmation email for non-COD orders
    prisma.user.findUnique({ where: { id: userId } }).then((user) => {
      if (user && user.email) {
        for (const order of orders) {
          if (order.paymentMethod !== "COD") {
            sendPaymentConfirmationEmail(user.email, { ...order, paymentStatus: "PAID" }).catch((err) => {
              logger.error(`Failed to send payment confirmation email for order #${order.id}`);
              logger.error(err);
            });
          }
        }
      }
    }).catch(() => {});
  } else if (status === "FAILURE") {
    await prisma.order.updateMany({
      where: { paymentReference },
      data: {
        paymentStatus: "FAILED",
        // Order remains PENDING so it can be retried
      },
    });
  } else if (status === "CANCEL") {
    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { paymentReference },
        data: {
          paymentStatus: "FAILED",
          orderStatus: "CANCELLED",
        },
      });

      // Release reserved inventory safely
      for (const order of orders) {
        if (order.orderStatus !== "CANCELLED") {
          for (const item of order.items) {
            await restockOnCancel(item.productId, item.quantity, userId, tx);
          }
        }
      }
    });
  }

  return await fetchEnrichedOrders(orders.map(o => o.id));
};


const fetchEnrichedOrders = async (orderIds) => {
  return await prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      seller: { select: { businessName: true } },
    },
  });
};
