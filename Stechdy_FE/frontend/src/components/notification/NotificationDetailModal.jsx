import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./NotificationDetailModal.css";

const NotificationDetailModal = ({ notification, isOpen, onClose, onMarkAsRead }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Helper to get translated content if translation key exists
  const getTranslatedContent = (content, fallback) => {
    if (!content) return fallback || "";
    
    // Check if content is a translation key (starts with common prefixes)
    if (typeof content === 'string' && 
        (content.startsWith('notifications.') || 
         content.startsWith('dashboard.') || 
         content.startsWith('study.') ||
         content.startsWith('mood.') ||
         content.startsWith('task.'))) {
      try {
        const translated = t(content);
        // If translation returns the key itself, use fallback
        return translated !== content ? translated : fallback || content;
      } catch (e) {
        return fallback || content;
      }
    }
    
    // Map common hardcoded Vietnamese text to translation keys (backwards compatibility)
    const hardcodedMap = {
      '🌟 Nhắc nhở: Ghi lại cảm xúc hôm nay!': 'notifications.content.moodCheckinTitle',
      'Ghi nhận tâm trạng': 'notifications.content.moodCheckinTitle',
      'Hôm nay bạn cảm thấy thế nào? Hãy dành chút thời gian ghi lại tâm trạng của bạn': 'notifications.content.moodCheckinMessage',
      'Hãy dành vài giây để ghi lại cảm xúc của bạn. Điều này giúp bạn theo dõi sức khỏe tinh thần tốt hơn!': 'notifications.content.moodCheckinMessage',
      'Đây là email test. Hãy dành vài giây để ghi lại cảm xúc của bạn.': 'notifications.content.moodCheckinMessage',
    };
    
    // Remove emoji and extra spaces for matching
    const cleanContent = typeof content === 'string' ? content.replace(/[\ud800-\udfff]./g, '').trim() : content;
    const mappedKey = hardcodedMap[content] || hardcodedMap[cleanContent];
    
    if (mappedKey) {
      return t(mappedKey);
    }
    
    return content;
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  const getNotificationIcon = (type) => {
    const iconMap = {
      mood_checkin: "😊",
      mood_reminder: "😊",
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
    return iconMap[type] || "🔔";
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { label: t("notifications.priority.low"), className: "priority-low" },
      normal: { label: t("notifications.priority.normal"), className: "priority-normal" },
      high: { label: t("notifications.priority.high"), className: "priority-high" },
    };
    return priorityMap[priority] || priorityMap.normal;
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    // Get current language from i18n
    const currentLang = i18n.language || localStorage.getItem('i18nextLng') || 'en';
    const locale = currentLang.startsWith('vi') ? "vi-VN" : "en-US";
    
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format metadata values based on type
  const formatMetadataValue = (key, value) => {
    if (value === null || value === undefined) return "";
    
    // Check if value is a date string or date object
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (typeof value === 'string' && datePattern.test(value)) {
      return formatDateTime(value);
    }
    
    // Check if key suggests it's a time field
    if (typeof value === 'string' && (key.toLowerCase().includes('time') || key.toLowerCase().includes('date'))) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return formatDateTime(value);
      }
    }
    
    // Format objects
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Translate metadata keys
  const translateMetadataKey = (key) => {
    const keyMap = {
      subjectName: t("notifications.metadata.subjectName") || "Môn học",
      startTime: t("notifications.metadata.startTime") || "Thời gian bắt đầu",
      endTime: t("notifications.metadata.endTime") || "Thời gian kết thúc",
      reminderType: t("notifications.metadata.reminderType") || "Loại nhắc nhở",
      hoursUntil: t("notifications.metadata.hoursUntil") || "Còn lại (giờ)",
      deadlineType: t("notifications.metadata.deadlineType") || "Loại deadline",
      date: t("notifications.metadata.date") || "Ngày",
      time: t("notifications.metadata.time") || "Thời gian",
      duration: t("notifications.metadata.duration") || "Thời lượng",
      location: t("notifications.metadata.location") || "Địa điểm",
    };
    
    return keyMap[key] || key;
  };

  const handleActionClick = () => {
    if (notification.actionUrl) {
      // Mark as read if unread
      if (!notification.isRead && onMarkAsRead) {
        onMarkAsRead(notification._id);
      }

      // Navigate to the action URL
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleNavigateByType = () => {
    // Mark as read if unread
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }

    // Navigate based on notification type and relatedType
    let targetUrl = null;

    switch (notification.type) {
      case "study_reminder":
        targetUrl = "/study-sessions";
        if (notification.relatedId) {
          targetUrl = `/study-sessions/${notification.relatedId}`;
        }
        break;

      case "task_reminder":
        targetUrl = "/tasks";
        if (notification.relatedId) {
          targetUrl = `/tasks/${notification.relatedId}`;
        }
        break;

      case "mood_checkin":
      case "mood_reminder":
        targetUrl = "/mood-tracking";
        break;

      case "achievement":
      case "level_up":
      case "streak_milestone":
        targetUrl = "/gamification";
        break;

      case "subscription":
      case "payment":
        targetUrl = "/premium";
        break;

      case "admin_message":
      case "announcement":
        targetUrl = "/notifications";
        break;

      case "system":
        if (notification.relatedType === "SmartNote") {
          targetUrl = "/smart-notes";
        } else {
          targetUrl = "/notifications";
        }
        break;

      default:
        targetUrl = "/notifications";
    }

    if (targetUrl) {
      navigate(targetUrl);
      onClose();
    }
  };

  const priority = getPriorityBadge(notification.priority);
  const displayTitle = getTranslatedContent(notification.title, notification.title);
  const displayMessage = getTranslatedContent(notification.message, notification.message);

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <span className="modal-icon">{getNotificationIcon(notification.type)}</span>
            <h2 className="modal-title">{displayTitle}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label={t("common.close")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-info">
            <div className="info-row">
              <span className={`priority-badge ${priority.className}`}>
                {priority.label}
              </span>
              {!notification.isRead && (
                <span className="unread-badge">{t("notifications.unread")}</span>
              )}
            </div>
            <div className="info-row">
              <span className="info-label">{t("notifications.createdAt")}:</span>
              <span className="info-value">{formatDateTime(notification.createdAt)}</span>
            </div>
            {notification.readAt && (
              <div className="info-row">
                <span className="info-label">{t("notifications.readAt")}:</span>
                <span className="info-value">{formatDateTime(notification.readAt)}</span>
              </div>
            )}
          </div>

          <div className="modal-message">
            <h3>{t("notifications.message")}</h3>
            <p>{displayMessage}</p>
          </div>

          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="modal-metadata">
              <h3>{t("notifications.details")}</h3>
              <div className="metadata-grid">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <div key={key} className="metadata-item">
                    <span className="metadata-key">{translateMetadataKey(key)}:</span>
                    <span className="metadata-value">
                      {formatMetadataValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!notification.isRead && onMarkAsRead && (
            <button
              className="modal-action-btn primary"
              onClick={() => {
                onMarkAsRead(notification._id);
                onClose();
              }}
            >
              {t("notifications.markAsRead")}
            </button>
          )}
          <button className="modal-action-btn secondary" onClick={onClose}>
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
