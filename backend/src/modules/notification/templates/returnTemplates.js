import { baseTemplate } from "./baseTemplate.js";
import env from "../../../config/env.js";

export const getReturnSubmittedHtml = (returnRequest) => {
  return baseTemplate({
    heading: `Return Request Submitted (#${returnRequest.id})`,
    bodyHtml: `
      <p>We've received your return request for <strong>${returnRequest.product?.name || "your item"}</strong> from order #${returnRequest.orderId}.</p>
      <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${returnRequest.reason}</p>
        <p style="margin: 4px 0;"><strong>Est. Refund Amount:</strong> ₹${returnRequest.refundAmount}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Under Review</p>
      </div>
      <p>The seller will review your request shortly.</p>
    `,
    buttonText: "Track Return",
    buttonUrl: `${env.CLIENT_URL}/returns`,
  });
};

export const getSellerReturnAlertHtml = (returnRequest) => {
  return baseTemplate({
    heading: `New Return Request Received (#${returnRequest.id})`,
    bodyHtml: `
      <p>A customer has requested a return for order #${returnRequest.orderId}.</p>
      <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>Product:</strong> ${returnRequest.product?.name || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${returnRequest.reason}</p>
        <p style="margin: 4px 0;"><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount}</p>
      </div>
      <p>Please log in to your seller dashboard to approve or reject this return request.</p>
    `,
    buttonText: "Review Return Request",
    buttonUrl: `${env.CLIENT_URL}/seller/returns`,
  });
};

export const getReturnApprovedHtml = (returnRequest) => {
  return baseTemplate({
    heading: `Return Request Approved! 🎉`,
    bodyHtml: `
      <p>Your return request for <strong>${returnRequest.product?.name || "your item"}</strong> from order #${returnRequest.orderId} has been approved!</p>
      <p>A return pickup will be assigned to a delivery partner shortly.</p>
      <p><strong>Refund Amount:</strong> ₹${returnRequest.refundAmount}</p>
    `,
    buttonText: "Track Return",
    buttonUrl: `${env.CLIENT_URL}/returns`,
  });
};

export const getReturnRejectedHtml = (returnRequest, reason) => {
  return baseTemplate({
    heading: `Return Request Update`,
    bodyHtml: `
      <p>Your return request for order #${returnRequest.orderId} was not approved.</p>
      ${reason ? `<div style="background-color: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 13px;"><strong>Reason:</strong> ${reason}</div>` : ""}
    `,
    buttonText: "View Return Details",
    buttonUrl: `${env.CLIENT_URL}/returns`,
  });
};

export const getRefundInitiatedHtml = (returnRequest, refund) => {
  return baseTemplate({
    heading: `Refund Initiated (#${refund.id})`,
    bodyHtml: `
      <p>We've initiated a refund of <strong>₹${refund.amount}</strong> for your returned item from order #${returnRequest.orderId}.</p>
      <p><strong>Payment Method:</strong> ${refund.paymentMethod}</p>
      <p>It will be processed according to standard settlement timelines.</p>
    `,
  });
};

export const getRefundCompletedHtml = (returnRequest, refund) => {
  return baseTemplate({
    heading: `Refund Completed! 💰`,
    bodyHtml: `
      <p>Your refund of <strong>₹${refund.amount}</strong> for order #${returnRequest.orderId} has been successfully completed.</p>
      <p><strong>Payment Method:</strong> ${refund.paymentMethod}</p>
    `,
  });
};
