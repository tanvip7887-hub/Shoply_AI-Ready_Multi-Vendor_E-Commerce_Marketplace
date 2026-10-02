import { baseTemplate } from "./baseTemplate.js";
import env from "../../../config/env.js";

export const getSellerApplicationSubmittedHtml = (businessName) => {
  return baseTemplate({
    heading: "Application Submitted",
    bodyHtml: `<p>We've received your seller application for <strong>${businessName}</strong>. Our team will review it and notify you of the decision soon.</p>`,
  });
};

export const getSellerApprovedHtml = (businessName) => {
  return baseTemplate({
    heading: "Application Approved",
    bodyHtml: `<p>Congratulations! Your seller application for <strong>${businessName}</strong> has been approved. Log in to complete your payout setup and start listing products.</p>`,
    buttonText: "Go to Seller Login",
    buttonUrl: `${env.CLIENT_URL}/login`, // We changed this earlier from /seller/login
  });
};

export const getSellerRejectedHtml = (businessName, reason) => {
  return baseTemplate({
    heading: "Application Not Approved",
    bodyHtml: `<p>Your seller application for <strong>${businessName}</strong> was not approved.</p><p><strong>Reason:</strong> ${reason}</p><p>You're welcome to submit a new application addressing this feedback.</p>`,
  });
};

export const getSellerNewOrderHtml = (order) => {
  const items = order.items || [];
  return baseTemplate({
    heading: `New Order Received (#${order.id})`,
    bodyHtml: `
      <p>Congratulations! You have received a new order on Shoply.</p>
      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod || "COD"}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 1px solid #eee; text-align: left;">
            <th style="padding: 8px 0; color: #111827;">Item</th>
            <th style="padding: 8px 0; color: #111827; text-align: right;">Qty</th>
            <th style="padding: 8px 0; color: #111827; text-align: right;">Amount</th>
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

      <p style="text-align: right; font-weight: bold; font-size: 14px;">Total Order Amount: ₹${order.totalAmount}</p>

      ${order.shippingAddress ? `
        <div style="margin-top: 12px; font-size: 13px; color: #4B5563;">
          <strong>Shipping To:</strong><br />
          ${order.shippingAddress.fullName}<br />
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
        </div>
      ` : ""}
    `,
    buttonText: "View Orders in Dashboard",
    buttonUrl: `${env.CLIENT_URL}/seller/orders`,
  });
};

