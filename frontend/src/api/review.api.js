import axiosClient from "./axiosClient.js";

export const reviewApi = {
  createReview: (data) => axiosClient.post("/reviews", data),
  getProductReviews: (productId) => axiosClient.get(`/products/${productId}/reviews`),
  getOrderReviewStatus: (orderId) => axiosClient.get(`/orders/${orderId}/review-status`),
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
  getSellerReviews: () => axiosClient.get("/seller/reviews"),
};
