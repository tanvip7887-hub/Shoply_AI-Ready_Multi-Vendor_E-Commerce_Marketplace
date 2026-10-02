import axiosClient from "./axiosClient.js";

export const notificationApi = {
  getNotifications: () => axiosClient.get("/notifications"),
  getUnreadCount: () => axiosClient.get("/notifications/unread-count"),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.patch("/notifications/read-all"),
};
