import axiosClient from "./axiosClient.js";

export const checkoutApi = {
  getCheckout: (addressId = null) => {
    const params = addressId ? { addressId } : {};
    return axiosClient.get("/checkout", { params });
  }
};
