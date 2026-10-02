import { useState, useEffect } from "react";
import { Bell, CheckCheck, Check, Clock, Filter, BellOff } from "lucide-react";
import { notificationApi } from "../api/notification.api.js";
import toast from "react-hot-toast";

const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL | UNREAD

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      const list = res.data?.data || res.data || [];
      setNotifications(list);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await notificationApi.markAsRead(id);
    } catch {
      toast.error("Failed to mark as read");
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await notificationApi.markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
      fetchNotifications();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={24} className="text-brand-600" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your account updates and order alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            <CheckCheck size={18} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filter === "ALL" ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filter === "UNREAD" ? "bg-white text-gray-900 shadow-sm" : "hover:text-gray-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-700">{filteredNotifications.length}</span> item(s)
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent mb-2"></div>
          <p className="text-sm font-medium">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <BellOff size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Notifications</h3>
          <p className="text-xs text-gray-500 mt-1">
            {filter === "UNREAD"
              ? "You have no unread notifications right now."
              : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-xl border transition-all ${
                !n.isRead
                  ? "bg-white border-brand-200 shadow-sm ring-1 ring-brand-100"
                  : "bg-white border-gray-200 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      !n.isRead ? "bg-brand-600" : "bg-gray-300"
                    }`}
                  />
                  <div>
                    <h3 className={`text-base font-semibold ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                      {n.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                      <Clock size={12} />
                      <span>{formatFullDate(n.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check size={14} /> Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
