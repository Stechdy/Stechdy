import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import notificationService from "../../services/notificationService";
import { useSocket } from "../../context/SocketContext";
import NotificationItem from "./NotificationItem";
import NotificationDetailModal from "./NotificationDetailModal";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', or 'seen'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const dropdownRef = useRef(null);

  // Use Socket.IO context
  const {
    isConnected,
    notifications: socketNotifications,
    setNotifications: setSocketNotifications,
    unreadCount: socketUnreadCount,
    setUnreadCount: setSocketUnreadCount,
  } = useSocket();

  useEffect(() => {
    loadNotifications();

    // Only use polling as fallback when socket is disconnected
    if (!isConnected) {
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        const notifs = response.data;
        setNotifications(notifs);
        setUnreadCount(response.unreadCount);

        // Update socket context state
        if (setSocketNotifications) {
          setSocketNotifications(notifs);
        }
        if (setSocketUnreadCount) {
          setSocketUnreadCount(response.unreadCount);
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Sync with socket notifications
  useEffect(() => {
    if (isConnected && socketNotifications) {
      setNotifications(socketNotifications);
    }
  }, [socketNotifications, isConnected]);

  // Sync with socket unread count
  useEffect(() => {
    if (isConnected && socketUnreadCount !== undefined) {
      setUnreadCount(socketUnreadCount);
    }
  }, [socketUnreadCount, isConnected]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      loadNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "mood_checkin":
      case "mood_reminder":
        return "😊";
      case "study_reminder":
        return "📚";
      case "task_reminder":
        return "✅";
      case "achievement":
        return "🏆";
      case "level_up":
        return "⭐";
      case "streak_milestone":
        return "🔥";
      case "subscription":
        return "💎";
      case "payment":
        return "💳";
      case "admin_message":
        return "👨‍💼";
      case "announcement":
        return "📢";
      case "system":
        return "🔔";
      default:
        return "🔔";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / 60000);

    if (diffInMinutes < 1) return t("notifications.time.justNow");
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${t("notifications.time.minutesAgo")}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} ${t("notifications.time.hoursAgo")}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${t("notifications.time.daysAgo")}`;
  };

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "all" 
      ? notifications 
      : activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications.filter((n) => n.isRead); // seen

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      loadNotifications(); // Refresh when opening
    }
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className={`bell-button ${isConnected ? "connected" : "disconnected"}`}
        onClick={toggleDropdown}
        title={isConnected ? "Realtime connected" : "Offline mode"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {isConnected && <span className="connection-indicator"></span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>{t("notifications.title")}</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={handleMarkAllAsRead}
                disabled={loading}
              >
                {loading ? "..." : t("notifications.markAllRead")}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="notification-tabs">
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              {t("notifications.all")} ({notifications.length})
            </button>
            <button
              className={`tab ${activeTab === "unread" ? "active" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              {t("notifications.unread")} ({unreadCount})
            </button>
            <button
              className={`tab ${activeTab === "seen" ? "active" : ""}`}
              onClick={() => setActiveTab("seen")}
            >
              {t("notifications.seen")} ({notifications.length - unreadCount})
            </button>
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  {activeTab === "unread" ? "✅" : activeTab === "seen" ? "📭" : "🔔"}
                </span>
                <p>
                  {activeTab === "unread"
                    ? t("notifications.noUnreadNotifications")
                    : activeTab === "seen"
                    ? t("notifications.noSeenNotifications")
                    : t("notifications.noNotifications")}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <NotificationItem
                  key={notif._id}
                  notification={notif}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClick={() => handleNotificationClick(notif)}
                  viewMode="card"
                />
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <button
                className="view-all-btn"
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/notifications");
                }}
              >
                {t("notifications.viewAll")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default NotificationBell;
