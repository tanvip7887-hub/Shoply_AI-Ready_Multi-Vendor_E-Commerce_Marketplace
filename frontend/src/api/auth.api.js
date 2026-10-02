import axiosClient from "./axiosClient.js";

export const authApi = {
  register: (payload) => axiosClient.post("/auth/register", payload),
  verifyEmail: (payload) => axiosClient.post("/auth/verify-email", payload),
  resendEmailOtp: (payload) => axiosClient.post("/auth/resend-email-otp", payload),
  login: (payload) => axiosClient.post("/auth/login", payload),
  logout: () => axiosClient.post("/auth/logout"),
  getMe: () => axiosClient.get("/auth/me"),
  forgotPassword: (payload) => axiosClient.post("/auth/reset-password", payload),
  resetPassword: (payload) => axiosClient.post("/auth/reset-password", payload),
  changePassword: (payload) => axiosClient.patch("/auth/change-password", payload),
};