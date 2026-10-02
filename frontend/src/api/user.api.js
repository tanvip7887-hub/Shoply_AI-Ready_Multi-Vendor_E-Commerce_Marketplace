import axiosClient from "./axiosClient.js";

export const userApi = {
    getMe: () => axiosClient.get("/users/me"),
    updateMe: (payload) => axiosClient.put("/users/me", payload),
    uploadAvatar: (formData) =>
        axiosClient.patch("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};