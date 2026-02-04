import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSocket } from "../../context/SocketContext";
import notificationService from "../../services/notificationService";
import NotificationDetailModal from "../../components/notification/NotificationDetailModal";
import "./Notifications.css";

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifs, setFilteredNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // all, unread, seen
  const [activeType, setActiveType] = useState("all"); // all, mood, study, task, etc.
  const [selectedNotifs, setSelectedNotifs] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    isConnected,
    notifications: socketNotifications,
    unreadCount,
  } = useSocket();

  useEffect(() => {
    loadNotifications();
  }, []);

  // Sync with socket
  useEffect(() => {
    if (isConnected && socketNotifications) {
      setNotifications(socketNotifications);
    }
  }, [socketNotifications, isConnected]);

  // Apply filters
  useEffect(() => {
    let filtered = [...notifications];

    // Filter by read status
    if (activeFilter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (activeFilter === "seen") {
      filtered = filtered.filter((n) => n.isRead);
    }

    // Filter by type
    if (activeType !== "all") {
      filtered = filtered.filter((n) => n.type.includes(activeType));
    }

    setFilteredNotifs(filtered);
  }, [notifications, activeFilter, activeType]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelectedNotifs((prev) => prev.filter((nId) => nId !== id));
    } catch (error) {
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedNotifs.map((id) => notificationService.deleteNotification(id))
      );
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifs.includes(n._id))
      );
      setSelectedNotifs([]);
      setSelectMode(false);
    } catch (error) {
    }
  };

  const handleSelectNotif = (id) => {
    if (selectedNotifs.includes(id)) {
      setSelectedNotifs((prev) => prev.filter((nId) => nId !== id));
    } else {
      setSelectedNotifs((prev) => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifs.length === filteredNotifs.length) {
      setSelectedNotifs([]);
    } else {
      setSelectedNotifs(filteredNotifs.map((n) => n._id));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!selectMode) {
      setSelectedNotification(notification);
      setShowDetailModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      mood_checkin: "😊",
      mood_reminder: "💭",
      study_reminder: "📚",
      task_reminder: "✅",
      achievement: "🏆",
      level_up: "⭐",
      streak_milestone: "🔥",
      subscription: "💎",
      payment: "💳",
      admin_message: "👨‍💼",
      announcement: "📢",
      system: "🔔",
    };
    return icons[type] || "🔔";
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
    if (diffInDays < 7)
      return `${diffInDays} ${t("notifications.time.daysAgo")}`;

    return notifDate.toLocaleDateString(
      i18n.language === "vi" ? "vi-VN" : "en-US",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const typeLabels = {
    all: t("notifications.types.all"),
    mood: t("notifications.types.mood"),
    study: t("notifications.types.study"),
    task: t("notifications.types.task"),
    achievement: t("notifications.types.achievement"),
    system: t("notifications.types.system"),
  };

  return (
    <div className="notifications-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button 
              className="back-button" 
              onClick={() => navigate(-1)}
              title={t("common.back") || "Back"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1>{t("notifications.title")}</h1>
            <span className="connection-status">
              {isConnected ? (
                <>
                  <span className="status-dot online"></span>
                  {t("notifications.connected")}
                </>
              ) : (
                <>
                  <span className="status-dot offline"></span>
                  {t("notifications.offline")}
                </>
              )}
            </span>
          </div>

          <div className="header-actions">
            {selectMode ? (
              <>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    setSelectMode(false);
                    setSelectedNotifs([]);
                  }}
                >
                  {t("notifications.cancel")}
                </button>
                <button
                  className="action-btn danger"
                  onClick={handleDeleteSelected}
                  disabled={selectedNotifs.length === 0}
                >
                  {t("notifications.delete")} ({selectedNotifs.length})
                </button>
              </>
            ) : (
              <>
                {unreadCount > 0 && (
                  <button
                    className="action-btn primary"
                    onClick={handleMarkAllAsRead}
                  >
                    {t("notifications.markAllRead")}
                  </button>
                )}
                <button
                  className="action-btn secondary"
                  onClick={() => setSelectMode(true)}
                >
                  {t("notifications.selectAll")}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <div className="filter-buttons">
              {["all", "unread", "seen"].map((filter) => (
                <button
                  key={filter}
                  className={`filter-btn ${
                    activeFilter === filter ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === "all" &&
                    `${t("notifications.all")} (${notifications.length})`}
                  {filter === "unread" &&
                    `${t("notifications.unread")} (${unreadCount})`}
                  {filter === "seen" &&
                    `${t("notifications.seen")} (${
                      notifications.length - unreadCount
                    })`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-buttons">
              {Object.entries(typeLabels).map(([key, label]) => (
                <button
                  key={key}
                  className={`filter-btn ${activeType === key ? "active" : ""}`}
                  onClick={() => setActiveType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Select All */}
        {selectMode && filteredNotifs.length > 0 && (
          <div className="select-all-bar">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedNotifs.length === filteredNotifs.length}
                onChange={handleSelectAll}
              />
              {t("notifications.selectAll")} ({filteredNotifs.length})
            </label>
          </div>
        )}

        {/* Notifications List */}
        <div className="notifications-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t("common.loading")}</p>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">
                {activeFilter === "unread" ? "✅" : activeFilter === "seen" ? "📭" : "🔔"}
              </span>
              <h3>
                {activeFilter === "unread"
                  ? t("notifications.noUnreadNotifications")
                  : activeFilter === "seen"
                  ? t("notifications.noSeenNotifications")
                  : t("notifications.noNotifications")}
              </h3>
            </div>
          ) : (
            <div className="notifications-grid">
              {filteredNotifs.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-card ${
                    !notif.isRead ? "unread" : ""
                  } ${selectedNotifs.includes(notif._id) ? "selected" : ""}`}
                  onClick={() => {
                    if (selectMode) {
                      handleSelectNotif(notif._id);
                    } else {
                      handleNotificationClick(notif);
                    }
                  }}
                >
                  {selectMode && (
                    <div className="select-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedNotifs.includes(notif._id)}
                        onChange={() => handleSelectNotif(notif._id)}
                      />
                    </div>
                  )}

                  <div className="card-icon">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="card-content">
                    <div className="card-header">
                      <h3>{notif.title}</h3>
                      {!notif.isRead && (
                        <span className="unread-badge">
                          {t("notifications.new")}
                        </span>
                      )}
                    </div>
                    <p className="card-message">{notif.message}</p>
                    <div className="card-footer">
                      <span className="card-time">
                        {formatTime(notif.createdAt)}
                      </span>
                      <span className="card-type">
                        {typeLabels[notif.type.split("_")[0]] ||
                          t("notifications.types.other")}
                      </span>
                    </div>
                  </div>

                  {!selectMode && (
                    <button
                      className="card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif._id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default Notifications;
