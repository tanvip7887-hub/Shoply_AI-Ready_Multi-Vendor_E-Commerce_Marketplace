import axiosClient from "./axiosClient.js";

export const categoryApi = {
  getAll: (params) => axiosClient.get("/categories", { params }),
  create: (data) => axiosClient.post("/categories", data),
  update: (id, data) => axiosClient.put(`/categories/${id}`, data),
  delete: (id) => axiosClient.delete(`/categories/${id}`),
};