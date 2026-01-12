import React from "react";
import { useTranslation } from "react-i18next";
import "./NotificationItem.css";

const NotificationItem = ({
  notification,
  isSelected = false,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClick,
  viewMode = "table", // 'table' or 'card'
}) => {
  const { t } = useTranslation();

  // Helper to get translated content if translation key exists
  const getTranslatedContent = (content, fallback) => {
    if (!content) return fallback || "";
    
    // Check if content is a translation key (starts with common prefixes)
    if (typeof content === 'string' && 
        (content.startsWith('notifications.') || 
         content.startsWith('dashboard.') || 
         content.startsWith('study.'))) {
      try {
        const translated = t(content);
        // If translation returns the key itself, use fallback
        return translated !== content ? translated : fallback || content;
      } catch (e) {
        return fallback || content;
      }
    }
    return content;
  };

  const displayTitle = getTranslatedContent(notification.title, notification.title);
  const displayMessage = getTranslatedContent(notification.message, notification.message);

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

  const getNotificationTypeLabel = (type) => {
    const typeMap = {
      mood_checkin: t("notifications.types.moodCheckin"),
      mood_reminder: t("notifications.types.moodReminder"),
      study_reminder: t("notifications.types.studyReminder"),
      task_reminder: t("notifications.types.taskReminder"),
      achievement: t("notifications.types.achievement"),
      level_up: t("notifications.types.levelUp"),
      streak_milestone: t("notifications.types.streakMilestone"),
      subscription: t("notifications.types.subscription"),
      payment: t("notifications.types.payment"),
      admin_message: t("notifications.types.adminMessage"),
      announcement: t("notifications.types.announcement"),
      system: t("notifications.types.system"),
    };
    return typeMap[type] || type;
  };

  const getNotificationTypeColor = (type) => {
    const colorMap = {
      mood_checkin: "mood",
      mood_reminder: "mood",
      study_reminder: "study",
      task_reminder: "task",
      achievement: "achievement",
      level_up: "achievement",
      streak_milestone: "streak",
      subscription: "premium",
      payment: "premium",
      admin_message: "admin",
      announcement: "announcement",
      system: "system",
    };
    return colorMap[type] || "default";
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

    return notifDate.toLocaleDateString();
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  if (viewMode === "card") {
    // Card view (for dropdown)
    return (
      <div
        className={`notification-card ${!notification.isRead ? "unread" : ""}`}
        onClick={handleClick}
      >
        <div className="card-indicator">
          {!notification.isRead && <span className="unread-dot"></span>}
        </div>
        <div className="card-icon">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="card-content">
          <h4 className="card-title">{displayTitle}</h4>
          <p className="card-message">{displayMessage}</p>
          <div className="card-meta">
            <span className="card-time">{formatTime(notification.createdAt)}</span>
          </div>
        </div>
        <button
          className="card-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          title={t("notifications.delete")}
          aria-label={t("notifications.delete")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  // Table view
  return (
    <div
      className={`notification-row ${!notification.isRead ? "unread" : ""} ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <div className="row-cell checkbox-cell">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(notification._id)}
          onClick={(e) => e.stopPropagation()}
          className="notification-checkbox"
          aria-label={t("notifications.selectNotification")}
        />
      </div>

      <div className="row-cell status-cell">
        <div className="status-indicator">
          {!notification.isRead ? (
            <span className="status-badge unread" title={t("notifications.unread")}>
              <span className="status-dot"></span>
              <span className="status-text">{t("notifications.unread")}</span>
            </span>
          ) : (
            <span className="status-badge read" title={t("notifications.read")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="status-text">{t("notifications.read")}</span>
            </span>
          )}
        </div>
      </div>

      {/* type-cell removed per design (no type label) */}

      <div className="row-cell message-cell">
        <div className="message-content">
          <h4 className="message-title">{displayTitle}</h4>
          <p className="message-text">{displayMessage}</p>
        </div>
      </div>

      <div className="row-cell time-cell">
        <span className="time-text">{formatTime(notification.createdAt)}</span>
      </div>

      <div className="row-cell actions-cell">
        <div className="action-buttons">
          {!notification.isRead ? (
            <button
              className="action-icon-btn mark-read"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification._id);
              }}
              title={t("notifications.markAsRead")}
              aria-label={t("notifications.markAsRead")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <button
              className="action-icon-btn mark-unread"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsUnread(notification._id);
              }}
              title={t("notifications.markAsUnread")}
              aria-label={t("notifications.markAsUnread")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18.364 5.636L5.636 18.364M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button
            className="action-icon-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification._id);
            }}
            title={t("notifications.delete")}
            aria-label={t("notifications.delete")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
