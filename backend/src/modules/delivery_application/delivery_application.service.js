import prisma from "../../config/prisma.js";
import logger from "../../utils/logger.js";
import {
  sendDeliveryApplicationSubmittedEmail,
  sendDeliveryApplicationApprovedEmail,
  sendDeliveryApplicationRejectedEmail,
} from "../notification/notification.service.js";

export const createApplication = async (userId, { phone, vehicleType, city }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  if (user.role === "DELIVERY_AGENT") {
    const err = new Error("User is already an approved Delivery Agent");
    err.statusCode = 400;
    throw err;
  }

  const existingPending = await prisma.deliveryPartnerApplication.findFirst({
    where: { userId, status: "PENDING" },
  });
  if (existingPending) {
    const err = new Error("You already have a pending Delivery Partner application");
    err.statusCode = 400;
    throw err;
  }

  const application = await prisma.deliveryPartnerApplication.create({
    data: {
      userId,
      phone,
      vehicleType,
      city,
      status: "PENDING",
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  if (application.user && application.user.email) {
    sendDeliveryApplicationSubmittedEmail(
      application.user.email,
      application.user.name,
      vehicleType,
      city
    ).catch((err) => {
      logger.error(`Failed to send delivery application submission email for user #${userId}`);
      logger.error(err);
    });
  }

  return application;
};

export const getMyApplication = async (userId) => {
  const application = await prisma.deliveryPartnerApplication.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
  return application;
};

export const getAllApplications = async (status) => {
  const where = status ? { status } : {};
  const applications = await prisma.deliveryPartnerApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      reviewedByAdmin: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  return applications;
};

export const getApplicationById = async (id) => {
  const application = await prisma.deliveryPartnerApplication.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      reviewedByAdmin: {
        select: { id: true, name: true, email: true },
      },
    },
  });
  if (!application) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }
  return application;
};

export const approveApplication = async (id, adminId) => {
  const application = await prisma.deliveryPartnerApplication.findUnique({
    where: { id: Number(id) },
  });
  if (!application) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }
  if (application.status !== "PENDING") {
    const err = new Error(`Application status is already ${application.status}`);
    err.statusCode = 400;
    throw err;
  }

  const [updatedApp, updatedUser] = await prisma.$transaction([
    prisma.deliveryPartnerApplication.update({
      where: { id: Number(id) },
      data: {
        status: "APPROVED",
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.user.update({
      where: { id: application.userId },
      data: { role: "DELIVERY_AGENT" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  updatedApp.user = updatedUser;

  if (updatedApp.user && updatedApp.user.email) {
    sendDeliveryApplicationApprovedEmail(
      updatedApp.user.email,
      updatedApp.user.name
    ).catch((err) => {
      logger.error(`Failed to send delivery application approval email for app #${id}`);
      logger.error(err);
    });
  }

  return updatedApp;
};

export const rejectApplication = async (id, adminId, rejectionReason) => {
  const application = await prisma.deliveryPartnerApplication.findUnique({
    where: { id: Number(id) },
  });
  if (!application) {
    const err = new Error("Application not found");
    err.statusCode = 404;
    throw err;
  }
  if (application.status !== "PENDING") {
    const err = new Error(`Application status is already ${application.status}`);
    err.statusCode = 400;
    throw err;
  }

  const updatedApp = await prisma.deliveryPartnerApplication.update({
    where: { id: Number(id) },
    data: {
      status: "REJECTED",
      rejectionReason,
      reviewedByAdminId: adminId,
      reviewedAt: new Date(),
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  if (updatedApp.user && updatedApp.user.email) {
    sendDeliveryApplicationRejectedEmail(
      updatedApp.user.email,
      updatedApp.user.name,
      rejectionReason
    ).catch((err) => {
      logger.error(`Failed to send delivery application rejection email for app #${id}`);
      logger.error(err);
    });
  }

  return updatedApp;
};

