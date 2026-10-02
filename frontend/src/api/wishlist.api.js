import axiosClient from "./axiosClient.js";

export const wishlistApi = {
  getAll: () => axiosClient.get("/wishlist"),
  add: (productId) => axiosClient.post(`/wishlist/${productId}`),
  remove: (productId) => axiosClient.delete(`/wishlist/${productId}`),
};