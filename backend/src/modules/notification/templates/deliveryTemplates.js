import { baseTemplate } from "./baseTemplate.js";
import env from "../../../config/env.js";

export const getDeliveryApplicationSubmittedHtml = (applicantName, vehicleType, city) => {
  return baseTemplate({
    heading: "Delivery Partner Application Submitted",
    bodyHtml: `
      <p>Hello <strong>${applicantName}</strong>,</p>
      <p>Thank you for applying to become a Shoply Delivery Partner. We have received your application and it is currently under review.</p>
      <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>Status:</strong> PENDING / UNDER REVIEW</p>
        <p style="margin: 4px 0;"><strong>Vehicle Type:</strong> ${vehicleType || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>City:</strong> ${city || "N/A"}</p>
      </div>
      <p>Our onboarding team will review your details and notify you once your application is approved.</p>
    `,
  });
};

export const getDeliveryApplicationApprovedHtml = (applicantName) => {
  return baseTemplate({
    heading: "Application Approved! 🎉",
    bodyHtml: `
      <p>Hello <strong>${applicantName}</strong>,</p>
      <p>Great news! Your application to become a Shoply Delivery Partner has been approved.</p>
      <p>You can now log in to the delivery portal to view available pick-ups, claim shipments, and manage deliveries.</p>
    `,
    buttonText: "Access Delivery Portal",
    buttonUrl: `${env.CLIENT_URL}/delivery`,
  });
};

export const getDeliveryApplicationRejectedHtml = (applicantName, reason) => {
  return baseTemplate({
    heading: "Delivery Partner Application Update",
    bodyHtml: `
      <p>Hello <strong>${applicantName}</strong>,</p>
      <p>Thank you for your interest in becoming a Shoply Delivery Partner.</p>
      <p>Unfortunately, your application was not approved at this time.</p>
      ${reason ? `<p style="background-color: #fee2e2; color: #991b1b; padding: 12px; border-radius: 6px; font-size: 13px;"><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>If you have any questions or would like to re-apply in the future, please contact support.</p>
    `,
  });
};
