import { baseTemplate } from "./baseTemplate.js";
import env from "../../../config/env.js";



export const getPasswordResetEmailHtml = (rawToken) => {
  const link = `${env.CLIENT_URL}/reset-password/${rawToken}`;
  return baseTemplate({
    heading: "Reset your password",
    bodyHtml: `<p>We received a request to reset your password. This link is valid for ${env.RESET_TOKEN_EXPIRES_MIN} minutes. If you didn't request this, you can ignore this email safely.</p>`,
    buttonText: "Reset Password",
    buttonUrl: link,
  });
};

export const getPasswordChangedEmailHtml = () => {
  return baseTemplate({
    heading: "Password changed",
    bodyHtml: `<p>Your account password was just changed. If this wasn't you, please contact support immediately.</p>`,
  });
};

export const getWelcomeEmailHtml = (name) => {
  return baseTemplate({
    heading: `Welcome, ${name}!`,
    bodyHtml: `<p>Your account is verified and ready to go. Start exploring the marketplace today.</p>`,
    buttonText: "Start Shopping",
    buttonUrl: env.CLIENT_URL,
  });
};

export const getRegistrationOtpEmailHtml = (otp) => {
  return baseTemplate({
    heading: "Verify your Shoply email address",
    bodyHtml: `
      <p>Hello,</p>
      <p>Your Shoply verification code is:</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #E11D48;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #6b7280;">This code expires in 10 minutes.</p>
      <p style="font-size: 13px; color: #6b7280;">If you did not create this account, you can ignore this email.</p>
    `,
  });
};

