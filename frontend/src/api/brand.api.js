import axiosClient from "./axiosClient.js";

export const brandApi = {
  getAll: (params) => axiosClient.get("/brands", { params }),
  create: (payload) => axiosClient.post("/brands", payload),
  update: (id, payload) => axiosClient.put(`/brands/${id}`, payload),
  updateStatus: (id, isActive) => axiosClient.patch(`/brands/${id}/status`, { isActive }),
  delete: (id) => axiosClient.delete(`/brands/${id}`),
};