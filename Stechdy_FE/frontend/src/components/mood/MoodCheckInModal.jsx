import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./MoodCheckInModal.css";

const MoodCheckInModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleCheckIn = () => {
    onClose();
    navigate("/mood");
  };

  const handleSkip = () => {
    localStorage.setItem("moodCheckInSkipped", new Date().toDateString());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="check-in-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-emoji-large">😊</div>

        <h2 className="modal-title">{t("moodCheckIn.title")}</h2>

        <p className="modal-description">{t("moodCheckIn.description")}</p>

        <div className="modal-actions">
          <button className="check-in-btn" onClick={handleCheckIn}>
            {t("moodCheckIn.recordMood")}
          </button>

          <button className="skip-btn" onClick={handleSkip}>
            {t("moodCheckIn.maybeLater")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckInModal;
