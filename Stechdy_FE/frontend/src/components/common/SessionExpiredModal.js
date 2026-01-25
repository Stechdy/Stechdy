import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import "../../styles/SessionExpiredModal.css";

const SessionExpiredModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleRedirectToLogin = () => {
    // Clear tokens and user data
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    if (onClose) onClose();

    // Redirect to login page
    window.location.href = "/login";
  };

  return createPortal(
    <div className="session-expired-overlay">
      <div className="session-expired-modal">
        <div className="session-expired-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="35" fill="#FEE2E2" />
            <path
              d="M40 20C29 20 20 29 20 40C20 51 29 60 40 60C51 60 60 51 60 40C60 29 51 20 40 20ZM40 55C31.73 55 25 48.27 25 40C25 31.73 31.73 25 40 25C48.27 25 55 31.73 55 40C55 48.27 48.27 55 40 55Z"
              fill="#DC2626"
            />
            <path
              d="M35 35L45 45M45 35L35 45"
              stroke="#DC2626"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 className="session-expired-title">{t("sessionExpired.title")}</h2>

        <p className="session-expired-message">{t("sessionExpired.message")}</p>

        <div className="session-expired-actions">
          <button
            className="session-expired-btn"
            onClick={handleRedirectToLogin}
          >
            {t("sessionExpired.loginButton")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SessionExpiredModal;
