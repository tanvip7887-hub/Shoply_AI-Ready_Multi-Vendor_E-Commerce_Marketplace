import { z } from "zod";

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
};

export const resetPasswordSchema = {
  body: z
    .object({
      email: z.string().min(1, "Email is required").email("Invalid email address"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

export const forgotPasswordSchema = resetPasswordSchema;

export const changePasswordSchema = {
  body: z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  }),
};

export const verifyEmailOtpSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "Verification code must be 6 digits"),
  }),
};

export const resendEmailOtpSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
};

