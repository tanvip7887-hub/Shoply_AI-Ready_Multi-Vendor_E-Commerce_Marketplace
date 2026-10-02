import axiosClient from "./axiosClient.js";

export const sellerProfileApi = {
    getMine: () => axiosClient.get("/seller/profile"),
    update: (payload) => axiosClient.put("/seller/profile", payload),
    uploadAvatar: (formData) =>
        axiosClient.patch("/seller/profile/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};