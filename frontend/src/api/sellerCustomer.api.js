import axiosClient from "./axiosClient.js";

export const sellerCustomerApi = {
  getCustomers: (params) => axiosClient.get("/seller/customers", { params }),
  getCustomerDetails: (customerId) => axiosClient.get(`/seller/customers/${customerId}`),
};
