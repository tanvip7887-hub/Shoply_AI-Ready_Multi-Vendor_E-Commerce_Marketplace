import axiosClient from "./axiosClient.js";

export const addressApi = {
  getAddresses: () => axiosClient.get("/addresses"),
  getAddress: (id) => axiosClient.get(`/addresses/${id}`),
  createAddress: (data) => axiosClient.post("/addresses", data),
  updateAddress: (id, data) => axiosClient.patch(`/addresses/${id}`, data),
  deleteAddress: (id) => axiosClient.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => axiosClient.patch(`/addresses/${id}/default`),
};
