import prisma from "../../config/prisma.js";
import crypto from "crypto";
import { hashValue, compareValue } from "../../utils/hash.util.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateRawToken,
  hashToken,
} from "../../utils/token.util.js";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendRegistrationOtpEmail,
} from "../notification/notification.service.js";
import env from "../../config/env.js";
import logger from "../../utils/logger.js";

const safeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
});

export const issueTokens = async (user) => {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ ...payload, jti: crypto.randomUUID() });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  let user;
  if (existing) {
    if (existing.isEmailVerified) {
      const err = new Error("Email is already registered");
      err.statusCode = 409;
      throw err;
    }
    // If user exists as an unverified CUSTOMER, update password & name for re-attempt
    if (existing.role === "CUSTOMER") {
      const hashedPassword = await hashValue(password);
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { name, password: hashedPassword },
      });
    } else {
      const err = new Error("Email is already registered");
      err.statusCode = 409;
      throw err;
    }
  } else {
    const hashedPassword = await hashValue(password);
    user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "CUSTOMER", isEmailVerified: false },
    });
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const tokenHash = hashToken(otp);

  // Invalidate any existing verification tokens for this user
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  // Create new OTP token record
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
    },
  });

  // Send OTP Email asynchronously (non-blocking)
  sendRegistrationOtpEmail(user.email, otp).catch((err) => {
    logger.error(`Failed to send registration OTP email to ${user.email}`);
    logger.error(err);
  });

  return {
    user: safeUser(user),
    requiresVerification: true,
    message: "Registration successful. Please verify the code sent to your email.",
  };
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.isEmailVerified) {
    const tokens = await issueTokens(user);
    return { message: "Email is already verified", user: safeUser(user), ...tokens };
  }

  // Find verification token
  const tokenRecord = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!tokenRecord) {
    const err = new Error("No verification code found. Please request a new code.");
    err.statusCode = 400;
    throw err;
  }

  if (tokenRecord.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: tokenRecord.id } });
    const err = new Error("Verification code expired. Please request a new code.");
    err.statusCode = 400;
    throw err;
  }

  if (tokenRecord.attempts >= 5) {
    await prisma.emailVerificationToken.delete({ where: { id: tokenRecord.id } });
    const err = new Error("Too many incorrect attempts. Please request a new code.");
    err.statusCode = 400;
    throw err;
  }

  const inputHash = hashToken(otp);
  if (inputHash !== tokenRecord.tokenHash) {
    const updatedAttempts = tokenRecord.attempts + 1;
    if (updatedAttempts >= 5) {
      await prisma.emailVerificationToken.delete({ where: { id: tokenRecord.id } });
      const err = new Error("Too many incorrect attempts. Please request a new code.");
      err.statusCode = 400;
      throw err;
    } else {
      await prisma.emailVerificationToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: updatedAttempts },
      });
      const err = new Error("Invalid verification code");
      err.statusCode = 400;
      throw err;
    }
  }

  // Verification succeeded!
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true },
  });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  // Issue login tokens
  const tokens = await issueTokens(updatedUser);

  // Send welcome email asynchronously
  sendWelcomeEmail(updatedUser.email, updatedUser.name).catch(() => {});

  return {
    message: "Email verified successfully",
    user: safeUser(updatedUser),
    ...tokens,
  };
};

export const resendEmailOtp = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.isEmailVerified) {
    const err = new Error("Email is already verified");
    err.statusCode = 400;
    throw err;
  }

  // Cooldown check (60 seconds)
  const recentToken = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(Date.now() - 60 * 1000) },
    },
  });

  if (recentToken) {
    const err = new Error("Please wait 60 seconds before requesting a new code.");
    err.statusCode = 429;
    throw err;
  }

  // Invalidate previous tokens
  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  // Generate new 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const tokenHash = hashToken(otp);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
    },
  });

  sendRegistrationOtpEmail(user.email, otp).catch((err) => {
    logger.error(`Failed to send resend OTP email to ${user.email}`);
    logger.error(err);
  });

  return { message: "Verification code sent successfully." };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compareValue(password, user.password))) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (user.status === "BLOCKED") {
    const err = new Error("Your account has been blocked. Contact support.");
    err.statusCode = 403;
    throw err;
  }

  // Restrict unverified login ONLY for CUSTOMER role
  if (user.role === "CUSTOMER" && !user.isEmailVerified) {
    const err = new Error("Please verify your email before logging in.");
    err.statusCode = 403;
    throw err;
  }

  const tokens = await issueTokens(user);
  return { user: safeUser(user), ...tokens };
};



export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken) },
    data: { revoked: true },
  });
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    const err = new Error("Refresh token missing");
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    const err = new Error("Refresh token is no longer valid");
    err.statusCode = 401;
    throw err;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  return issueTokens(user);
};

export const resetPassword = async ({ email, newPassword, confirmPassword }) => {
  if (confirmPassword && newPassword !== confirmPassword) {
    const err = new Error("Passwords do not match");
    err.statusCode = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("User with this email does not exist");
    err.statusCode = 404;
    throw err;
  }

  const hashedPassword = await hashValue(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    }),
  ]);
};

export const forgotPassword = async (payload) => {
  return resetPassword(payload);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!(await compareValue(oldPassword, user.password))) {
    const err = new Error("Current password is incorrect");
    err.statusCode = 401;
    throw err;
  }
  const hashedPassword = await hashValue(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
  await sendPasswordChangedEmail(user.email);
};

export const getMeUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return safeUser(user);
};
