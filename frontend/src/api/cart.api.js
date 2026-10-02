import axiosClient from "./axiosClient.js";

export const cartApi = {
  getCart: () => axiosClient.get("/cart"),
  addItem: (payload) => axiosClient.post("/cart/items", payload),
  updateItem: (id, payload) => axiosClient.patch(`/cart/items/${id}`, payload),
  removeItem: (id) => axiosClient.delete(`/cart/items/${id}`),
  clear: () => axiosClient.delete("/cart"),
};