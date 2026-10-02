import axiosClient from "./axiosClient.js";

export const sellerPayoutApi = {
    getMine: () => axiosClient.get("/seller/payout"),
    save: (payload) => axiosClient.post("/seller/payout", payload),
    getPayments: (params) => axiosClient.get("/seller/payout/payments", { params }),
};