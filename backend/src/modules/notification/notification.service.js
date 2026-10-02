import prisma from "../../config/prisma.js";
import { sendMail } from "./email.service.js";
import {
  getPasswordResetEmailHtml,
  getPasswordChangedEmailHtml,
  getWelcomeEmailHtml,
  getRegistrationOtpEmailHtml,
} from "./templates/authTemplates.js";
import {
  getOrderConfirmationHtml,
  getOrderShippedHtml,
  getOrderDeliveredHtml,
  getOrderCancelledHtml,
  getOrderOutForDeliveryHtml,
  getPaymentConfirmationHtml,
} from "./templates/orderTemplates.js";
import {
  getSellerApplicationSubmittedHtml,
  getSellerApprovedHtml,
  getSellerRejectedHtml,
  getSellerNewOrderHtml,
} from "./templates/sellerTemplates.js";
import {
  getDeliveryApplicationSubmittedHtml,
  getDeliveryApplicationApprovedHtml,
  getDeliveryApplicationRejectedHtml,
} from "./templates/deliveryTemplates.js";
import {
  getReturnSubmittedHtml,
  getSellerReturnAlertHtml,
  getReturnApprovedHtml,
  getReturnRejectedHtml,
  getRefundInitiatedHtml,
  getRefundCompletedHtml,
} from "./templates/returnTemplates.js";

// --- In-App Notifications ---

export const createNotification = async (userId, title, message) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

export const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getUnreadNotificationCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return count;
};

export const markNotificationAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: Number(notificationId) },
  });

  if (!notification || notification.userId !== userId) {
    const err = new Error("Notification not found");
    err.statusCode = 404;
    throw err;
  }

  return prisma.notification.update({
    where: { id: Number(notificationId) },
    data: { isRead: true },
  });
};

export const markAllNotificationsAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

// --- Authentication Notifications ---

export const sendPasswordResetEmail = (to, rawToken) => {
  return sendMail({
    to,
    subject: "Reset your Shoply password",
    html: getPasswordResetEmailHtml(rawToken),
  });
};

export const sendPasswordChangedEmail = (to) => {
  return sendMail({
    to,
    subject: "Your Shoply password was changed",
    html: getPasswordChangedEmailHtml(),
  });
};

export const sendWelcomeEmail = (to, name) => {
  return sendMail({
    to,
    subject: "Welcome to Shoply!",
    html: getWelcomeEmailHtml(name),
  });
};

export const sendRegistrationOtpEmail = (to, otp) => {
  return sendMail({
    to,
    subject: "Verify your Shoply email address",
    html: getRegistrationOtpEmailHtml(otp),
  });
};


// --- Order Notifications ---

export const sendOrderConfirmationEmail = (to, order) => {
  return sendMail({
    to,
    subject: `Order Confirmation (#${order.id})`,
    html: getOrderConfirmationHtml(order),
  });
};

export const sendOrderShippedEmail = (to, order) => {
  return sendMail({
    to,
    subject: `Your order (#${order.id}) has shipped!`,
    html: getOrderShippedHtml(order),
  });
};

export const sendOrderOutForDeliveryEmail = (to, order) => {
  return sendMail({
    to,
    subject: `Your order (#${order.id}) is out for delivery! 🚚`,
    html: getOrderOutForDeliveryHtml(order),
  });
};

export const sendOrderDeliveredEmail = (to, order) => {
  return sendMail({
    to,
    subject: `Your order (#${order.id}) has been delivered`,
    html: getOrderDeliveredHtml(order),
  });
};

export const sendOrderCancelledEmail = (to, order) => {
  return sendMail({
    to,
    subject: `Order Cancelled (#${order.id}) - Shoply`,
    html: getOrderCancelledHtml(order),
  });
};

// --- Payment Notifications ---

export const sendPaymentConfirmationEmail = (to, order) => {
  return sendMail({
    to,
    subject: `Payment Successful - Order #${order.id}`,
    html: getPaymentConfirmationHtml(order),
  });
};

// --- Seller Notifications ---

export const sendSellerApplicationSubmittedEmail = (to, businessName) => {
  return sendMail({
    to,
    subject: "Seller Application Submitted - Shoply",
    html: getSellerApplicationSubmittedHtml(businessName),
  });
};

export const sendSellerApprovedEmail = (to, businessName) => {
  return sendMail({
    to,
    subject: "Seller Application Approved - Shoply 🎉",
    html: getSellerApprovedHtml(businessName),
  });
};

export const sendSellerRejectedEmail = (to, businessName, reason) => {
  return sendMail({
    to,
    subject: "Seller Application Rejected - Shoply",
    html: getSellerRejectedHtml(businessName, reason),
  });
};

export const sendSellerNewOrderEmail = (to, order) => {
  return sendMail({
    to,
    subject: `New Order Received - Shoply (#${order.id})`,
    html: getSellerNewOrderHtml(order),
  });
};

// --- Delivery Partner Notifications ---

export const sendDeliveryApplicationSubmittedEmail = (to, applicantName, vehicleType, city) => {
  return sendMail({
    to,
    subject: "Delivery Partner Application Submitted - Shoply",
    html: getDeliveryApplicationSubmittedHtml(applicantName, vehicleType, city),
  });
};

export const sendDeliveryApplicationApprovedEmail = (to, applicantName) => {
  return sendMail({
    to,
    subject: "Delivery Partner Application Approved - Shoply 🎉",
    html: getDeliveryApplicationApprovedHtml(applicantName),
  });
};

export const sendDeliveryApplicationRejectedEmail = (to, applicantName, reason) => {
  return sendMail({
    to,
    subject: "Delivery Partner Application Rejected - Shoply",
    html: getDeliveryApplicationRejectedHtml(applicantName, reason),
  });
};

// --- Return & Refund Notifications ---

export const sendReturnSubmittedEmail = (to, returnRequest) => {
  return sendMail({
    to,
    subject: `Return Request Submitted - Order #${returnRequest.orderId}`,
    html: getReturnSubmittedHtml(returnRequest),
  });
};

export const sendSellerReturnAlertEmail = (to, returnRequest) => {
  return sendMail({
    to,
    subject: `New Return Request Received - Order #${returnRequest.orderId}`,
    html: getSellerReturnAlertHtml(returnRequest),
  });
};

export const sendReturnApprovedEmail = (to, returnRequest) => {
  return sendMail({
    to,
    subject: `Return Request Approved - Order #${returnRequest.orderId} 🎉`,
    html: getReturnApprovedHtml(returnRequest),
  });
};

export const sendReturnRejectedEmail = (to, returnRequest, reason) => {
  return sendMail({
    to,
    subject: `Update on Return Request - Order #${returnRequest.orderId}`,
    html: getReturnRejectedHtml(returnRequest, reason),
  });
};

export const sendRefundInitiatedEmail = (to, returnRequest, refund) => {
  return sendMail({
    to,
    subject: `Refund Initiated - Order #${returnRequest.orderId}`,
    html: getRefundInitiatedHtml(returnRequest, refund),
  });
};

export const sendRefundCompletedEmail = (to, returnRequest, refund) => {
  return sendMail({
    to,
    subject: `Refund Completed - Order #${returnRequest.orderId} 💰`,
    html: getRefundCompletedHtml(returnRequest, refund),
  });
};


