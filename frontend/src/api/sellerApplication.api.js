import axiosClient from "./axiosClient.js";

export const sellerApplicationApi = {
    saveDraft: (payload) => axiosClient.post("/seller-applications/draft", payload),
    submit: (payload) => axiosClient.post("/seller-applications/submit", payload),
    getMine: () => axiosClient.get("/seller-applications/me"),
    uploadDocument: (formData) =>
        axiosClient.post("/seller-applications/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};