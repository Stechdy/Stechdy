import React from "react";
import { useTranslation } from "react-i18next";
import "./SuccessModal.css";

const SuccessModal = ({ isOpen, onClose, message, title }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div
        className="success-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-icon-wrapper">
          <svg
            className="success-checkmark"
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#10b981"
              strokeWidth="4"
              fill="none"
              className="success-circle"
            />
            <path
              d="M20 32L28 40L44 24"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="success-check"
            />
          </svg>
        </div>

        <h3 className="success-title">
          {title || t("common.success") || "Success!"}
        </h3>

        <p className="success-message">
          {message || t("common.savedSuccessfully") || "Your changes have been saved successfully!"}
        </p>

        <button className="success-modal-btn" onClick={onClose}>
          {t("common.ok") || "OK"}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
