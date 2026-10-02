import axiosClient from "./axiosClient.js";

export const paymentApi = {
  createMockPayment: (orderIds) => axiosClient.post("/payment/create-mock", { orderIds }),
  verifyMockPayment: (paymentReference, status) => 
    axiosClient.post("/payment/verify-mock", { paymentReference, status }),
};
