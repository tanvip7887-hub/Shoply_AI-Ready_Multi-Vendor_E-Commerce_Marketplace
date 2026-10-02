import axiosClient from "./axiosClient.js";

export const sellerDashboardApi = {
    getDashboard: () => axiosClient.get("/seller/dashboard"),
};