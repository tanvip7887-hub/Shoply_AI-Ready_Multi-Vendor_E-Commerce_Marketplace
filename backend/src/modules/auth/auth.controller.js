import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../utils/cookie.util.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  sendSuccess(res, { statusCode: 201, message: result.message, data: result.user });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken, message } = await authService.verifyEmailOtp(req.body);
  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
  sendSuccess(res, { statusCode: 200, message, data: user });
});

export const resendEmailOtp = asyncHandler(async (req, res) => {
  const result = await authService.resendEmailOtp(req.body);
  sendSuccess(res, { statusCode: 200, message: result.message });
});


export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
  sendSuccess(res, { message: "Logged in", data: user });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.cookies.refreshToken);
  res
    .clearCookie("accessToken", accessTokenCookieOptions)
    .clearCookie("refreshToken", refreshTokenCookieOptions);
  sendSuccess(res, { message: "Logged out" });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.refreshAccessToken(req.cookies.refreshToken);
  res
    .cookie("accessToken", accessToken, accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
  sendSuccess(res, { message: "Token refreshed" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, { message: "Password reset successfully" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, { message: "Password reset successfully" });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
  sendSuccess(res, { message: "Password changed successfully" });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMeUser(req.user.id);
  sendSuccess(res, { message: "Current user", data: user });
});
