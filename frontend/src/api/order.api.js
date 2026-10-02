import axiosClient from "./axiosClient.js";

export const orderApi = {
  createOrder: (data) => axiosClient.post("/orders", data),
  getMyOrders: () => axiosClient.get("/orders"),
  getMyOrderById: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id) => axiosClient.patch(`/orders/${id}/cancel`),
  getSellerOrders: (status) => axiosClient.get("/seller/orders", { params: status && status !== "ALL" ? { status } : {} }),
  getSellerOrderById: (id) => axiosClient.get(`/seller/orders/${id}`),
  updateOrderStatusBySeller: (id, orderStatus) => axiosClient.patch(`/seller/orders/${id}/status`, { orderStatus }),
  getSellerDashboard: () => axiosClient.get("/seller/orders/dashboard"),
};
