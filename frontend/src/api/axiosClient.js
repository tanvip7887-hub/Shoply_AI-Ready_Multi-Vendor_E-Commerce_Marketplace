import axios from "axios";
import toast from "react-hot-toast";
import env from "../config/env.js";

const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  withCredentials: true, // REQUIRED — backend auth is httpOnly cookies, not headers
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

axiosClient.interceptors.response.use(
  (response) => response.data, // unwrap { success, message, data } -> just data at call site
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Auto-refresh on 401, once, then retry the original request.
    // Prevents every logged-in-but-expired page load from bouncing
    // straight to login when a silent refresh would have fixed it.
    if (status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/")) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => resolve(axiosClient(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.post("/auth/refresh-token");
        isRefreshing = false;
        onRefreshed();
        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || "Something went wrong";
    if (status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;