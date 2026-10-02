import { Router } from "express";
import * as authController from "./auth.controller.js";
import authenticate from "../../middleware/authenticate.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailOtpSchema,
  resendEmailOtpSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-email", validate(verifyEmailOtpSchema), authController.verifyEmail);
router.post("/resend-email-otp", validate(resendEmailOtpSchema), authController.resendEmailOtp);
router.post("/login", validate(loginSchema), authController.login);

router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", validate(resetPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.patch("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);
router.get("/me", authenticate, authController.getMe);

// TEMPORARY — remove after testing authorize middleware
router.get("/admin-only", authenticate, authorize("ADMIN"), (req, res) => {
  res.json({ ok: true, message: "You are an admin" });
});

export default router;