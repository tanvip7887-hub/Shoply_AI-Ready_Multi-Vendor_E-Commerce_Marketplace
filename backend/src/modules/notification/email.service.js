import nodemailer from "nodemailer";
import env from "../../config/env.js";
import logger from "../../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verify SMTP connection when the server starts
transporter.verify((error, success) => {
  if (error) {
    logger.error("SMTP Connection Failed:");
    logger.error(error);
  } else {
    logger.info("SMTP Server is ready to send emails.");
  }
});

/**
 * Sends an email using Nodemailer.
 * Does not throw raw Nodemailer errors to the caller to prevent stack traces,
 * but still indicates success or failure.
 */
export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully. Message ID: ${info.messageId}, Recipient: ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Email sending failed for recipient: ${to}`);
    logger.error(err);
    // Return safe failure rather than throwing so callers don't need excessive try-catch,
    // unless they specifically want to throw on fail.
    // Given the prompt "handle transporter errors safely", returning success: false is safer.
    return { success: false, error: "Failed to send email" };
  }
};
