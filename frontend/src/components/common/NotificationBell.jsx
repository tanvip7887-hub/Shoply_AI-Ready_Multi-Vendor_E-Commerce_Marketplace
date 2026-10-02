import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bell, CheckCheck, Check, Clock, BellOff } from "lucide-react";
import { notificationApi } from "../../api/notification.api.js";
import toast from "react-hot-toast";

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const NotificationBell = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getUnreadCount();
      const count = res.data?.data?.unreadCount || res.data?.unreadCount || 0;
      setUnreadCount(count);
    } catch {
      // Silent error for poll/fetch
    }
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(false);
      const res = await notificationApi.getNotifications();
      const list = res.data?.data || res.data || [];
      setNotifications(list);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Periodic poll every 30s
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await notificationApi.markAsRead(id);
    } catch {
      toast.error("Failed to mark notification as read");
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await notificationApi.markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    setIsOpen(false);
    navigate("/notifications");
  };

  if (!isAuthenticated) return null;

  const badgeText = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex flex-col items-center gap-1 text-gray-800 hover:text-brand-600 transition-base focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <div className="relative">
          <Bell size={24} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-white animate-pulse">
              {badgeText}
            </span>
          )}
        </div>
        <span className="text-[12px] font-medium hidden sm:inline">Alerts</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="py-8 text-center text-gray-400">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-brand-600 border-t-transparent mb-1"></div>
                <p className="text-xs">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="py-6 text-center text-rose-500 text-xs px-4">
                Failed to load notifications. Please try again.
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 px-4">
                <BellOff size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">No Notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.isRead ? "bg-brand-50/40" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !n.isRead ? "bg-brand-600" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold text-gray-900 truncate ${!n.isRead ? "text-brand-900" : ""}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-0.5">
                        <Clock size={10} /> {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as read"
                      className="text-gray-400 hover:text-brand-600 p-1 rounded transition-colors shrink-0"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 block py-1"
            >
              View All Notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
