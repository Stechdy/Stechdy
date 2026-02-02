import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SidebarNav from "../../components/common/SidebarNav";
import BottomNav from "../../components/common/BottomNav";
import SuccessModal from "../../components/common/SuccessModal";
import settingsService from "../../services/settingsService";
import "./NotificationSettings.css";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [settings, setSettings] = useState({
    notification: {
      enabled: true,
      taskReminders: true,
      studyReminders: true,
      moodCheckIn: true,
      achievements: true,
      email: true,
      push: true,
    },
    sound: {
      enabled: true,
      volume: 50,
      timerSound: "bell",
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getSettings();
      if (response.success && response.data) {
        setSettings({
          notification: response.data.notification || settings.notification,
          sound: response.data.sound || settings.sound,
        });
      } else {
        // Fallback to localStorage if API fails
        const savedSettings = localStorage.getItem("notificationSettings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Fallback to localStorage
      const savedSettings = localStorage.getItem("notificationSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await settingsService.updateSettings(settings);
      
      if (response.success) {
        // Also save to localStorage as backup
        localStorage.setItem("notificationSettings", JSON.stringify(settings));
        setShowSuccessModal(true);
      } else {
        throw new Error(response.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      // Save to localStorage as fallback
      localStorage.setItem("notificationSettings", JSON.stringify(settings));
      alert(t("notificationSettings.saveFailed") || "Failed to save settings to server, but saved locally");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (category, field) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field],
      },
    }));
  };

  if (loading) {
    return (
      <div className="noti-settings-page">
        <SidebarNav />
        <div className="noti-settings-wrapper">
          <div className="noti-settings-loading">
            <div className="noti-settings-spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="noti-settings-page">
      <SidebarNav />
      <div className="noti-settings-wrapper">
        <div className="noti-settings-content">
          {/* Header */}
          <div className="noti-settings-header">
            <button
              className="noti-settings-back-btn"
              onClick={() => navigate("/account")}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="noti-settings-title">
              {t("notificationSettings.title") || "Notification Settings"}
            </h1>
          </div>

          {/* Notification Settings Section */}
          <div className="noti-settings-section">
            <div className="noti-settings-section-header">
              <div className="noti-settings-section-icon noti-settings-icon-bell">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 8A6 6 0 106 8C6 15 3 17 3 17H21S18 15 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="noti-settings-section-info">
                <h2>{t("notificationSettings.notifications") || "Notifications"}</h2>
                <p>{t("notificationSettings.notificationsDesc") || "Manage what notifications you receive"}</p>
              </div>
            </div>

            <div className="noti-settings-list">
              {/* Master Toggle */}
              <div className="noti-settings-item">
                <div className="noti-settings-item-info">
                  <h3>{t("notificationSettings.enableNotifications") || "Enable Notifications"}</h3>
                  <p>{t("notificationSettings.enableNotificationsDesc") || "Turn all notifications on or off"}</p>
                </div>
                <label className="noti-settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.notification.enabled}
                    onChange={() => handleToggle("notification", "enabled")}
                  />
                  <span className="noti-settings-toggle-slider"></span>
                </label>
              </div>

              {settings.notification.enabled && (
                <>
                  {/* Task Reminders */}
                  <div className="noti-settings-item">
                    <div className="noti-settings-item-info">
                      <h3>{t("notificationSettings.taskReminders") || "Task Reminders"}</h3>
                      <p>{t("notificationSettings.taskRemindersDesc") || "Get notified about upcoming tasks and deadlines"}</p>
                    </div>
                    <label className="noti-settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notification.taskReminders}
                        onChange={() => handleToggle("notification", "taskReminders")}
                      />
                      <span className="noti-settings-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Study Reminders */}
                  <div className="noti-settings-item">
                    <div className="noti-settings-item-info">
                      <h3>{t("notificationSettings.studyReminders") || "Study Session Reminders"}</h3>
                      <p>{t("notificationSettings.studyRemindersDesc") || "Reminders for scheduled study sessions"}</p>
                    </div>
                    <label className="noti-settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notification.studyReminders}
                        onChange={() => handleToggle("notification", "studyReminders")}
                      />
                      <span className="noti-settings-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Mood Check-in */}
                  <div className="noti-settings-item">
                    <div className="noti-settings-item-info">
                      <h3>{t("notificationSettings.moodCheckIn") || "Mood Check-in Reminders"}</h3>
                      <p>{t("notificationSettings.moodCheckInDesc") || "Daily reminders to log your mood"}</p>
                    </div>
                    <label className="noti-settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notification.moodCheckIn}
                        onChange={() => handleToggle("notification", "moodCheckIn")}
                      />
                      <span className="noti-settings-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Achievements */}
                  <div className="noti-settings-item">
                    <div className="noti-settings-item-info">
                      <h3>{t("notificationSettings.achievements") || "Achievements & Milestones"}</h3>
                      <p>{t("notificationSettings.achievementsDesc") || "Celebrate your progress and achievements"}</p>
                    </div>
                    <label className="noti-settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notification.achievements}
                        onChange={() => handleToggle("notification", "achievements")}
                      />
                      <span className="noti-settings-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Email Notifications */}
                  <div className="noti-settings-item">
                    <div className="noti-settings-item-info">
                      <h3>{t("notificationSettings.emailNotifications") || "Email Notifications"}</h3>
                      <p>{t("notificationSettings.emailNotificationsDesc") || "Receive notifications via email"}</p>
                    </div>
                    <label className="noti-settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notification.email}
                        onChange={() => handleToggle("notification", "email")}
                      />
                      <span className="noti-settings-toggle-slider"></span>
                    </label>
                  </div>

                  {/* Push Notifications */}
                  <div className="noti-settings-item">
                    <div className="noti-settings-item-info">
                      <h3>{t("notificationSettings.pushNotifications") || "Push Notifications"}</h3>
                      <p>{t("notificationSettings.pushNotificationsDesc") || "Receive push notifications in-app"}</p>
                    </div>
                    <label className="noti-settings-toggle">
                      <input
                        type="checkbox"
                        checked={settings.notification.push}
                        onChange={() => handleToggle("notification", "push")}
                      />
                      <span className="noti-settings-toggle-slider"></span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="noti-settings-actions">
            <button
              className="noti-settings-save-btn"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="noti-settings-btn-spinner"></div>
                  {t("common.saving") || "Saving..."}
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 21V13H7V21M7 3V8H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t("common.saveChanges")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t("notificationSettings.savedSuccessfully")}
      />
    </div>
  );
};

export default NotificationSettings;
