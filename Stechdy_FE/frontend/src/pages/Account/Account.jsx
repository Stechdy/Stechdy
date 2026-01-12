import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import "./Account.css";

const Account = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const themeOptions = [
    {
      value: "light",
      label: t("theme.lightMode"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      value: "dark",
      label: t("theme.darkMode"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      value: "system",
      label: t("theme.system"),
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="3"
            width="20"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 21H16M12 17V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  const getThemeIcon = () => {
    const option = themeOptions.find((opt) => opt.value === themeMode);
    return option ? option.icon : themeOptions[2].icon;
  };

  const getThemeLabel = () => {
    const option = themeOptions.find((opt) => opt.value === themeMode);
    return option ? option.label : t("theme.lightMode");
  };

  const languageOptions = [
    {
      value: "en",
      label: "English",
      flag: "🇺🇸",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="2"
            y1="12"
            x2="22"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      value: "vi",
      label: "Tiếng Việt",
      flag: "🇻🇳",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="2"
            y1="12"
            x2="22"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
  ];

  const getCurrentLanguage = () => {
    const currentLang = (i18n.language || "en").split("-")[0]; // Handle cases like 'en-US' -> 'en'
    const option = languageOptions.find((opt) => opt.value === currentLang);
    return option ? option.label : "English";
  };

  const getLanguageIcon = () => {
    const currentLang = (i18n.language || "en").split("-")[0];
    const option = languageOptions.find((opt) => opt.value === currentLang);
    return option ? option.icon : languageOptions[0].icon;
  };

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
    setShowLanguageModal(false);
  };

  const getPlanLabel = () => {
    const premiumStatus =
      userData?.premiumStatus || userData?.subscription?.status;
    return premiumStatus === "premium" || premiumStatus === "active"
      ? t("account.premiumPlan")
      : t("account.freePlan");
  };

  const isPremiumUser = () => {
    const premiumStatus =
      userData?.premiumStatus || userData?.subscription?.status;
    return premiumStatus === "premium" || premiumStatus === "active";
  };

  const settingsItems = [
    {
      id: "profile",
      label: t("account.userInformation"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      onClick: () => navigate("/profile"),
      iconBg: "icon-bg-blue",
    },
    {
      id: "appearance",
      label: t("account.appearance"),
      value: getThemeLabel(),
      icon: getThemeIcon(),
      onClick: () => setShowThemeModal(true),
      iconBg: "icon-bg-purple",
    },
    {
      id: "language",
      label: t("account.language"),
      value: getCurrentLanguage(),
      icon: getLanguageIcon(),
      onClick: () => setShowLanguageModal(true),
      iconBg: "icon-bg-cyan",
    },
    {
      id: "notifications",
      label: t("account.notifications") || t("account.soundNotifications"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
      ),
      onClick: () => navigate("/notification-settings"),
      iconBg: "icon-bg-orange",
    },
  ];

  const supportItems = [
    {
      id: "help",
      label: t("account.helpSupport"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      ),
      onClick: () => navigate("/help"),
      iconBg: "icon-bg-green",
    },
    {
      id: "about",
      label: t("account.aboutUs"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 16V12M12 8H12.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/about"),
      iconBg: "icon-bg-cyan",
    },
    {
      id: "terms",
      label: t("account.termsOfUse"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20M16 13H8M16 17H8M10 9H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/terms"),
      iconBg: "icon-bg-pink",
    },
  ];

  return (
    <div className="account-page">
      <SidebarNav />
      <div className="account-wrapper">
        <div className="account-content">
          {/* Page Title */}
          <h1 className="account-page-title">
            {t("account.pageTitle") || "Account"}
          </h1>

          <div className="account-content-grid">
            {/* Left Column - Profile & Premium */}
            <div className="account-left-column">
              {/* Profile Card */}
              <div className="profile-card">
                <div className="profile-card-inner">
                  <div className="profile-avatar-wrapper">
                    <img
                      src={
                        userData.avatarUrl ||
                        require("../../assets/STECHDY.webp")
                      }
                      alt="Profile"
                      className="profile-avatar"
                    />
                    <button
                      className="profile-edit-btn"
                      onClick={() => navigate("/profile")}
                      aria-label="Edit profile"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="profile-details">
                    <h2 className="profile-name">
                      {userData.name || "Sarah Johnson"}
                    </h2>
                    <p className="profile-email">
                      {userData.email || "sarah.johnson@email.com"}
                    </p>
                    <div className="profile-plan-badge">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span>{getPlanLabel()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upgrade Premium Card */}
              {!isPremiumUser() && (
                <button
                  className="premium-upgrade-card"
                  onClick={() => navigate("/pricing")}
                >
                  <div className="premium-upgrade-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="premium-upgrade-content">
                    <span className="premium-upgrade-title">
                      {t("account.upgradePremium")}
                    </span>
                    <span className="premium-upgrade-subtitle">
                      {t("account.unlockFeatures") ||
                        "Unlock all premium features"}
                    </span>
                  </div>
                  <svg
                    className="premium-upgrade-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Right Column - Settings & Support */}
            <div className="account-right-column">
              {/* Settings Section */}
              <div className="account-section">
                <h3 className="section-title">{t("account.settings")}</h3>
                <div className="settings-list">
                  {settingsItems.map((item) => (
                    <button
                      key={item.id}
                      className={`settings-item ${
                        item.displayMode === "dropdown"
                          ? "settings-item-dropdown"
                          : ""
                      }`}
                      onClick={item.onClick}
                    >
                      {item.displayMode === "dropdown" ? (
                        <>
                          <div className={`settings-item-icon ${item.iconBg}`}>
                            {item.icon}
                          </div>
                          <div className="settings-item-content">
                            <span className="settings-item-dropdown-value">
                              {item.value}
                            </span>
                          </div>
                          <svg
                            className="settings-item-chevron"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 9L12 15L18 9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <div className={`settings-item-icon ${item.iconBg}`}>
                            {item.icon}
                          </div>
                          <div className="settings-item-content">
                            <span className="settings-item-label">
                              {item.label}
                            </span>
                            {item.value && (
                              <span className="settings-item-value">
                                {item.value}
                              </span>
                            )}
                          </div>
                          <svg
                            className="settings-item-chevron"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 18L15 12L9 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div className="account-section">
                <h3 className="section-title">{t("account.support")}</h3>
                <div className="settings-list">
                  {supportItems.map((item) => (
                    <button
                      key={item.id}
                      className="settings-item"
                      onClick={item.onClick}
                    >
                      <div className={`settings-item-icon ${item.iconBg}`}>
                        {item.icon}
                      </div>
                      <div className="settings-item-content">
                        <span className="settings-item-label">
                          {item.label}
                        </span>
                      </div>
                      <svg
                        className="settings-item-chevron"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 18L15 12L9 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17L21 12L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t("account.logout")}</span>
          </button>

          {/* App Version */}
          <p className="app-version">S'Techdy v1.0.0</p>
        </div>

        {/* Theme Selection Modal */}
        {showThemeModal && (
          <div
            className="theme-modal-overlay"
            onClick={() => setShowThemeModal(false)}
          >
            <div className="theme-modal" onClick={(e) => e.stopPropagation()}>
              <div className="theme-modal-header">
                <h3>{t("theme.chooseTheme")}</h3>
                <button
                  className="theme-modal-close"
                  onClick={() => setShowThemeModal(false)}
                  aria-label="Close"
                >
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
              <div className="theme-options">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`theme-option ${
                      themeMode === option.value ? "active" : ""
                    }`}
                    onClick={() => {
                      setThemeMode(option.value);
                      setShowThemeModal(false);
                    }}
                  >
                    <div className="theme-option-icon">{option.icon}</div>
                    <span className="theme-option-label">{option.label}</span>
                    {themeMode === option.value && (
                      <svg
                        className="theme-option-check"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {themeMode === "system" && (
                <p className="theme-system-note">
                  {t("theme.currentlyUsing")}:{" "}
                  {resolvedTheme === "dark"
                    ? t("theme.dark")
                    : t("theme.light")}{" "}
                  ({t("account.systemSettings")})
                </p>
              )}
            </div>
          </div>
        )}

        {/* Language Selection Modal */}
        {showLanguageModal && (
          <div
            className="language-modal-overlay"
            onClick={() => setShowLanguageModal(false)}
          >
            <div
              className="language-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="language-modal-header">
                <h3>{t("account.chooseLanguage")}</h3>
                <button
                  className="language-modal-close"
                  onClick={() => setShowLanguageModal(false)}
                  aria-label="Close"
                >
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
              <div className="language-options">
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`language-option ${
                      i18n.language === option.value ? "active" : ""
                    }`}
                    onClick={() => changeLanguage(option.value)}
                  >
                    <div className="language-option-icon">{option.icon}</div>
                    <div className="language-option-content">
                      <span className="language-option-label">
                        {option.label}
                      </span>
                      <span className="language-option-flag">
                        {option.flag}
                      </span>
                    </div>
                    {i18n.language === option.value && (
                      <svg
                        className="language-option-check"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Account;
