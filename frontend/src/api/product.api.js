import axiosClient from "./axiosClient.js";

export const productApi = {
  getAll: (params) => axiosClient.get("/products", { params }),
  getBySlug: (slug) => axiosClient.get(`/products/slug/${slug}`),
  getById: (id) => axiosClient.get(`/products/${id}`),
  getMine: (params) => axiosClient.get("/products/me", { params }),
  create: (payload) => axiosClient.post("/products", payload),
  update: (id, payload) => axiosClient.put(`/products/${id}`, payload),
  updateStatus: (id, isActive) => axiosClient.patch(`/products/${id}/status`, { isActive }),
  delete: (id) => axiosClient.delete(`/products/${id}`),
  addImages: (id, formData) => axiosClient.post(`/products/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  removeImage: (id, imageId) => axiosClient.delete(`/products/${id}/images/${imageId}`),
  reorderImages: (id, payload) => axiosClient.put(`/products/${id}/images/reorder`, payload),
};

export const categoryApi = {
  getAll: (params) => axiosClient.get("/categories", { params }),
  create: (payload) => axiosClient.post("/categories", payload),
  update: (id, payload) => axiosClient.put(`/categories/${id}`, payload),
  delete: (id) => axiosClient.delete(`/categories/${id}`),
};