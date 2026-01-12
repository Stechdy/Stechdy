import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import notificationService from "../../services/notificationService";
import { useSocket } from "../../context/SocketContext";
import NotificationItem from "../../components/notification/NotificationItem";
import "./NotificationTable.css";

const NotificationTable = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'unread', 'read'
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const {
    isConnected,
    notifications: socketNotifications,
    unreadCount: socketUnreadCount,
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

  useEffect(() => {
    if (isConnected && socketUnreadCount !== undefined) {
      setUnreadCount(socketUnreadCount);
    }
  }, [socketUnreadCount, isConnected]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await notificationService.markAsUnread(id);
      loadNotifications();
    } catch (error) {
      console.error("Error marking as unread:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadNotifications();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    try {
      await Promise.all(selectedIds.map((id) => notificationService.markAsRead(id)));
      loadNotifications();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error marking selected as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      loadNotifications();
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(t("notifications.confirmDeleteSelected"))) return;
    try {
      await Promise.all(selectedIds.map((id) => notificationService.deleteNotification(id)));
      loadNotifications();
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error deleting selected notifications:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n._id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === "unread") return !notif.isRead;
    if (activeFilter === "read") return notif.isRead;
    return true; // all
  });

  return (
    <div className="notification-table-page">
      {/* Header */}
      <div className="notification-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="page-title">{t("notifications.title")}</h1>
            <p className="page-subtitle">
              {unreadCount > 0
                ? t("notifications.unreadMessage", { count: unreadCount })
                : t("notifications.allCaughtUp")}
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? "connected" : "disconnected"}`}></span>
            <span className="status-text">
              {isConnected ? t("notifications.realtime") : t("notifications.offline")}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="notification-actions-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            <span className="tab-label">{t("notifications.all")}</span>
            <span className="tab-count">{notifications.length}</span>
          </button>
          <button
            className={`filter-tab ${activeFilter === "unread" ? "active" : ""}`}
            onClick={() => setActiveFilter("unread")}
          >
            <span className="tab-label">{t("notifications.unread")}</span>
            <span className="tab-count badge-count">{unreadCount}</span>
          </button>
          <button
            className={`filter-tab ${activeFilter === "read" ? "active" : ""}`}
            onClick={() => setActiveFilter("read")}
          >
            <span className="tab-label">{t("notifications.read")}</span>
            <span className="tab-count">{notifications.length - unreadCount}</span>
          </button>
        </div>

        <div className="bulk-actions">
          {selectedIds.length > 0 ? (
            <>
              <span className="selected-count">
                {t("notifications.selected", { count: selectedIds.length })}
              </span>
              <button className="action-btn secondary" onClick={handleMarkSelectedAsRead}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t("notifications.markAsRead")}
              </button>
              <button className="action-btn danger" onClick={handleDeleteSelected}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t("notifications.delete")}
              </button>
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <button className="action-btn primary" onClick={handleMarkAllAsRead}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t("notifications.markAllRead")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notification Table */}
      <div className="notification-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t("notifications.loading")}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeFilter === "unread" ? "✅" : activeFilter === "read" ? "📭" : "🔔"}
            </div>
            <h3>{t("notifications.noNotificationsTitle")}</h3>
            <p>
              {activeFilter === "unread"
                ? t("notifications.noUnreadNotifications")
                : activeFilter === "read"
                ? t("notifications.noReadNotifications")
                : t("notifications.noNotifications")}
            </p>
          </div>
        ) : (
          <div className="notification-table">
            {/* Table Header */}
            <div className="table-header">
              <div className="header-cell checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="notification-checkbox"
                />
              </div>
              <div className="header-cell status-cell">{t("notifications.status")}</div>
              <div className="header-cell message-cell">{t("notifications.message")}</div>
              <div className="header-cell time-cell">{t("notifications.time")}</div>
              <div className="header-cell actions-cell">{t("notifications.actions")}</div>
            </div>

            {/* Table Body */}
            <div className="table-body">
              {filteredNotifications.map((notif) => (
                <NotificationItem
                  key={notif._id}
                  notification={notif}
                  isSelected={selectedIds.includes(notif._id)}
                  onSelect={handleSelectOne}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onDelete={handleDelete}
                  viewMode="table"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationTable;
