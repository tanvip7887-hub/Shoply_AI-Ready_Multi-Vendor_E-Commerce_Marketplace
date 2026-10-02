import { baseTemplate } from "./baseTemplate.js";
import env from "../../../config/env.js";

const renderAddress = (address) => {
  if (!address) return "";
  return `
    <div style="margin-top: 12px; font-size: 13px; color: #4B5563;">
      <strong>Shipping Address:</strong><br />
      ${address.fullName}<br />
      ${address.addressLine1} ${address.addressLine2 ? `<br />${address.addressLine2}` : ""}<br />
      ${address.city}, ${address.state} ${address.postalCode}<br />
      ${address.country}
    </div>
  `;
};

const renderItems = (items) => {
  if (!items || !items.length) return "";
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="border-bottom: 1px solid #eee; text-align: left;">
          <th style="padding: 8px 0; color: #111827;">Item</th>
          <th style="padding: 8px 0; color: #111827; text-align: right;">Qty</th>
          <th style="padding: 8px 0; color: #111827; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr style="border-bottom: 1px solid #f9fafb;">
            <td style="padding: 8px 0; color: #4B5563;">${item.productName}</td>
            <td style="padding: 8px 0; color: #4B5563; text-align: right;">${item.quantity}</td>
            <td style="padding: 8px 0; color: #4B5563; text-align: right;">₹${item.subtotal}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
};

export const getOrderConfirmationHtml = (order) => {
  return baseTemplate({
    heading: `Order Confirmation (#${order.id})`,
    bodyHtml: `
      <p>Thank you for your order! We've received it and will start processing it shortly.</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      ${renderItems(order.items)}
      <p style="text-align: right; font-weight: bold; font-size: 14px;">Total Amount: ₹${order.totalAmount}</p>
      ${renderAddress(order.shippingAddress)}
    `,
    buttonText: "View Order Details",
    buttonUrl: `${env.CLIENT_URL}/profile/orders`,
  });
};

export const getOrderShippedHtml = (order) => {
  return baseTemplate({
    heading: `Your order #${order.id} has shipped!`,
    bodyHtml: `
      <p>Great news! Your order is on its way.</p>
      ${renderItems(order.items)}
      ${renderAddress(order.shippingAddress)}
    `,
    buttonText: "Track Order",
    buttonUrl: `${env.CLIENT_URL}/profile/orders`,
  });
};

export const getOrderDeliveredHtml = (order) => {
  return baseTemplate({
    heading: `Your order #${order.id} has been delivered`,
    bodyHtml: `
      <p>Your order has been marked as delivered. We hope you enjoy your purchase!</p>
    `,
    buttonText: "View Order",
    buttonUrl: `${env.CLIENT_URL}/profile/orders`,
  });
};

export const getPaymentConfirmationHtml = (order) => {
  return baseTemplate({
    heading: `Payment Confirmation (#${order.id})`,
    bodyHtml: `
      <p>We've successfully received your payment of <strong>₹${order.totalAmount}</strong> for order #${order.id}.</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
    `,
  });
};

export const getOrderCancelledHtml = (order) => {
  return baseTemplate({
    heading: `Order Cancelled (#${order.id})`,
    bodyHtml: `
      <p>Your order <strong>#${order.id}</strong> has been successfully cancelled.</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p>If you were charged for this order, your refund will be processed according to payment terms.</p>
    `,
    buttonText: "View Your Orders",
    buttonUrl: `${env.CLIENT_URL}/profile/orders`,
  });
};

export const getOrderOutForDeliveryHtml = (order) => {
  return baseTemplate({
    heading: `Your order #${order.id} is Out for Delivery! 🚚`,
    bodyHtml: `
      <p>Good news! Your order <strong>#${order.id}</strong> is out for delivery today. Please ensure someone is available to receive it.</p>
      ${renderItems(order.items)}
      ${renderAddress(order.shippingAddress)}
    `,
    buttonText: "Track Order",
    buttonUrl: `${env.CLIENT_URL}/profile/orders`,
  });
};

