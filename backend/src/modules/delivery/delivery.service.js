import prisma from "../../config/prisma.js";
import logger from "../../utils/logger.js";
import { sendOrderDeliveredEmail, sendOrderOutForDeliveryEmail } from "../notification/notification.service.js";

const ALLOWED_SHIPMENT_TRANSITIONS = {
  PICKUP_CREATED: ["OUT_FOR_PICKUP"],
  OUT_FOR_PICKUP: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export const getAvailablePickups = async () => {
  return prisma.shipment.findMany({
    where: {
      shipmentStatus: "PICKUP_CREATED",
      deliveryAgentId: null,
    },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: {
              id: true,
              businessName: true,
              ownerName: true,
              mobileNumber: true,
              sellerAddress: true,
            },
          },
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getMyShipments = async (userId, statusFilter = "ALL") => {
  const where = { deliveryAgentId: userId };
  if (statusFilter && statusFilter !== "ALL") {
    where.shipmentStatus = statusFilter;
  }
  return prisma.shipment.findMany({
    where,
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: {
              id: true,
              businessName: true,
              ownerName: true,
              mobileNumber: true,
              sellerAddress: true,
            },
          },
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const getShipmentById = async (userId, shipmentId) => {
  const shipment = await prisma.shipment.findUnique({
    where: { id: Number(shipmentId) },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: {
              id: true,
              businessName: true,
              ownerName: true,
              mobileNumber: true,
              sellerAddress: true,
            },
          },
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!shipment) {
    const err = new Error("Shipment not found");
    err.statusCode = 404;
    throw err;
  }

  const isAvailable = shipment.deliveryAgentId === null && shipment.shipmentStatus === "PICKUP_CREATED";
  const isAssignedToAgent = shipment.deliveryAgentId === userId;

  if (!isAvailable && !isAssignedToAgent) {
    const err = new Error("You do not have access to this shipment");
    err.statusCode = 403;
    throw err;
  }

  return shipment;
};

export const acceptShipment = async (userId, shipmentId) => {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUnique({
      where: { id: Number(shipmentId) },
    });

    if (!shipment) {
      const err = new Error("Shipment not found");
      err.statusCode = 404;
      throw err;
    }

    if (shipment.deliveryAgentId !== null || shipment.shipmentStatus !== "PICKUP_CREATED") {
      const err = new Error("Shipment has already been claimed or is no longer available");
      err.statusCode = 409;
      throw err;
    }

    const updatedShipment = await tx.shipment.update({
      where: { id: Number(shipmentId) },
      data: { deliveryAgentId: userId },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            seller: { select: { businessName: true, mobileNumber: true } },
            items: true,
          },
        },
      },
    });

    return updatedShipment;
  });
};

export const updateShipmentStatus = async (userId, shipmentId, newStatus) => {
  const shipment = await prisma.shipment.findUnique({
    where: { id: Number(shipmentId) },
  });

  if (!shipment) {
    const err = new Error("Shipment not found");
    err.statusCode = 404;
    throw err;
  }

  if (shipment.deliveryAgentId !== userId) {
    const err = new Error("You are not authorized to update this shipment");
    err.statusCode = 403;
    throw err;
  }

  const allowedNext = ALLOWED_SHIPMENT_TRANSITIONS[shipment.shipmentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    const err = new Error(`Cannot transition shipment status from ${shipment.shipmentStatus} to ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  const updateData = { shipmentStatus: newStatus };
  if (newStatus === "PICKED_UP" && !shipment.pickedUpAt) {
    updateData.pickedUpAt = new Date();
  }
  if (newStatus === "DELIVERED" && !shipment.deliveredAt) {
    updateData.deliveredAt = new Date();
  }

  return prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: { id: Number(shipmentId) },
      data: updateData,
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            items: true,
          },
        },
      },
    });

    if (newStatus === "OUT_FOR_DELIVERY") {
      if (updatedShipment.order && updatedShipment.order.user && updatedShipment.order.user.email) {
        sendOrderOutForDeliveryEmail(updatedShipment.order.user.email, updatedShipment.order).catch((err) => {
          logger.error(`Failed to send order out for delivery email for order #${shipment.orderId}`);
          logger.error(err);
        });
      }
    } else if (newStatus === "DELIVERED") {
      // Synchronize Order status to DELIVERED when shipment reaches DELIVERED.
      // Payment status remains untouched (COD remains PENDING, ONLINE remains PAID).
      const updatedOrder = await tx.order.update({
        where: { id: shipment.orderId },
        data: { orderStatus: "DELIVERED" },
        include: { user: { select: { email: true } }, items: true },
      });

      sendOrderDeliveredEmail(updatedOrder.user.email, updatedOrder).catch((err) => {
        logger.error(`Failed to send order delivered email for order #${shipment.orderId}`);
        logger.error(err);
      });
    }

    return updatedShipment;
  });
};

