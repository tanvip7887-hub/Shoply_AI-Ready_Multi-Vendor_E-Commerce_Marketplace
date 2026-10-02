import axiosClient from "./axiosClient.js";

export const sellerInventoryApi = {
  getAll: (params) => axiosClient.get("/inventory/seller", { params }),
  getSummary: () => axiosClient.get("/inventory/seller/summary"),
  getById: (productId) => axiosClient.get(`/inventory/seller/${productId}`),
  updateStock: (productId, payload) => axiosClient.patch(`/inventory/seller/${productId}/stock`, payload),
};

export const adminInventoryApi = {
  getAll: (params) => axiosClient.get("/inventory/admin", { params }),
  getById: (productId) => axiosClient.get(`/inventory/admin/${productId}`),
};
