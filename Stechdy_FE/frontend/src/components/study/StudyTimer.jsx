import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import config from "../../config";
import "./StudyTimer.css";

const StudyTimer = ({ session, onEnd, onRefresh }) => {
  const { t } = useTranslation();
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const [remainingTime, setRemainingTime] = useState(0); // seconds
  const [countdownToStart, setCountdownToStart] = useState(0); // seconds until session starts
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(session?.isPaused || false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [focusLevel, setFocusLevel] = useState(3);
  const [completionNotes, setCompletionNotes] = useState("");

  // Calculate times
  const calculateTimes = useCallback(() => {
    if (!session) return;

    const now = new Date();

    // Parse startTime
    const [startHour, startMinute] = session.startTime.split(":").map(Number);
    const plannedStartTime = new Date(session.date);
    plannedStartTime.setHours(startHour, startMinute, 0, 0);

    // Check if session has started
    const hasSessionStarted = now >= plannedStartTime;
    setHasStarted(hasSessionStarted);

    // If not started yet, show countdown to start
    if (!hasSessionStarted) {
      const msToStart = plannedStartTime - now;
      const secondsToStart = Math.max(0, Math.floor(msToStart / 1000));
      setCountdownToStart(secondsToStart);
      setElapsedTime(0);
      setRemainingTime(0);
      return;
    }

    // Session has started - calculate elapsed and remaining time
    // ALWAYS calculate from startTime, not from actualStartTime
    const pausedDuration = (session.pausedDuration || 0) * 60 * 1000; // to milliseconds

    // Parse endTime
    const [endHour, endMinute] = session.endTime.split(":").map(Number);
    const plannedEndTime = new Date(session.date);
    plannedEndTime.setHours(endHour, endMinute, 0, 0);

    // Elapsed time from startTime (excluding paused time)
    const elapsedMs = now - plannedStartTime - pausedDuration;
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

    // Remaining time
    const remainingMs = plannedEndTime - now;
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    setElapsedTime(elapsedSeconds);
    setRemainingTime(remainingSeconds);
    setCountdownToStart(0);
  }, [session]);

  // Update timer every second
  useEffect(() => {
    if (!session || isPaused) return;

    calculateTimes();
    const interval = setInterval(() => {
      calculateTimes();
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isPaused, calculateTimes]);

  // Format time to MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle pause
  const handlePause = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/${session._id}/pause`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsPaused(true);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error("Error pausing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resume
  const handleResume = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/${session._id}/resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsPaused(false);
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error("Error resuming session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle end session
  const handleEndSession = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/${session._id}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            focusLevel,
            completionNotes,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShowEndModal(false);
        if (onEnd) onEnd(data);
      }
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  const progressPercent =
    Math.min(100, (elapsedTime / (elapsedTime + remainingTime)) * 100) || 0;

  // If session hasn't started yet, show countdown
  if (!hasStarted) {
    return (
      <div className="study-timer waiting">
        <div className="timer-header">
          <div className="timer-status">
            <span className="status-dot waiting"></span>
            <span className="status-text">{t("studyTimer.waiting")}</span>
          </div>
          <div className="timer-subject">
            📚 {session.subjectId?.subjectName || t("dashboard.studySession")}
          </div>
        </div>

        <div className="timer-display countdown">
          <div className="countdown-content">
            <div className="countdown-icon">⏰</div>
            <div className="countdown-text">
              <span className="countdown-label">
                {t("studyTimer.sessionStartsIn")}
              </span>
              <span className="countdown-value">
                {formatTime(countdownToStart)}
              </span>
            </div>
          </div>
        </div>

        <div className="timer-info">
          <span>
            🕐 {session.startTime} - {session.endTime}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`study-timer ${isPaused ? "paused" : "active"}`}>
        <div className="timer-header">
          <div className="timer-status">
            <span
              className={`status-dot ${isPaused ? "paused" : "active"}`}
            ></span>
            <span className="status-text">
              {isPaused ? t("studyTimer.paused") : t("studyTimer.studying")}
            </span>
          </div>
          <div className="timer-subject">
            📚 {session.subjectId?.subjectName || t("dashboard.studySession")}
          </div>
        </div>

        <div className="timer-display">
          <div className="time-block elapsed">
            <span className="time-label">{t("studyTimer.elapsed")}</span>
            <span className="time-value">{formatTime(elapsedTime)}</span>
          </div>

          <div className="timer-divider">
            <div className="progress-ring">
              <svg viewBox="0 0 100 100">
                <circle className="progress-bg" cx="50" cy="50" r="45" />
                <circle
                  className="progress-fill"
                  cx="50"
                  cy="50"
                  r="45"
                  style={{
                    strokeDasharray: `${progressPercent * 2.83} 283`,
                  }}
                />
              </svg>
              <span className="progress-text">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>

          <div className="time-block remaining">
            <span className="time-label">{t("studyTimer.remaining")}</span>
            <span className="time-value">{formatTime(remainingTime)}</span>
          </div>
        </div>

        <div className="timer-info">
          <span>
            🕐 {session.startTime} - {session.endTime}
          </span>
        </div>

        <div className="timer-actions">
          {isPaused ? (
            <button
              className="btn-timer btn-resume"
              onClick={handleResume}
              disabled={isLoading}
            >
              <span className="btn-icon">▶️</span>
              <span>{t("studyTimer.resume")}</span>
            </button>
          ) : (
            <button
              className="btn-timer btn-pause"
              onClick={handlePause}
              disabled={isLoading}
            >
              <span className="btn-icon">⏸️</span>
              <span>{t("studyTimer.pause")}</span>
            </button>
          )}

          <button
            className="btn-timer btn-end"
            onClick={() => setShowEndModal(true)}
            disabled={isLoading}
          >
            <span className="btn-icon">⏹️</span>
            <span>{t("studyTimer.end")}</span>
          </button>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="modal-overlay" onClick={() => setShowEndModal(false)}>
          <div
            className="end-session-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>🎉 {t("studyTimer.endSession")}</h3>

            <div className="modal-stats">
              <div className="stat-item">
                <span className="stat-label">
                  {t("studyTimer.timeStudied")}
                </span>
                <span className="stat-value">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            <div className="focus-rating">
              <label>{t("studyTimer.focusLevel")}</label>
              <div className="focus-stars">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    className={`star-btn ${
                      focusLevel >= level ? "active" : ""
                    }`}
                    onClick={() => setFocusLevel(level)}
                  >
                    {focusLevel >= level ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <span className="focus-text">
                {t(`studyTimer.focusLevels.${focusLevel}`)}
              </span>
            </div>

            <div className="completion-notes">
              <label>{t("studyTimer.notes")}</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder={t("studyTimer.notesPlaceholder")}
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowEndModal(false)}
              >
                {t("common.cancel")}
              </button>
              <button
                className="btn-confirm"
                onClick={handleEndSession}
                disabled={isLoading}
              >
                {isLoading ? t("studyTimer.saving") : t("studyTimer.complete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudyTimer;
