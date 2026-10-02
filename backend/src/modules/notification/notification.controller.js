import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notification.service.js";

export const getNotificationsController = asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user.id);
  sendSuccess(res, {
    message: "Notifications fetched successfully",
    data: notifications,
  });
});

export const getUnreadCountController = asyncHandler(async (req, res) => {
  const count = await getUnreadNotificationCount(req.user.id);
  sendSuccess(res, {
    message: "Unread count fetched successfully",
    data: { unreadCount: count },
  });
});

export const markAsReadController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await markNotificationAsRead(req.user.id, id);
  sendSuccess(res, {
    message: "Notification marked as read",
    data: updated,
  });
});

export const markAllAsReadController = asyncHandler(async (req, res) => {
  await markAllNotificationsAsRead(req.user.id);
  sendSuccess(res, {
    message: "All notifications marked as read",
    data: null,
  });
});
