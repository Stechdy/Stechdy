import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import { getVietnamTime, getVietnamDate } from "../../utils/helpers";
import config from "../../config";
import "./SlotDetail.css";

const SlotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [session, setSession] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [weekSessions, setWeekSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subjectId: "",
    startTime: "",
    endTime: "",
    status: "",
  });
  const [selectedMoveDate, setSelectedMoveDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [moveStartTime, setMoveStartTime] = useState("");
  const [moveEndTime, setMoveEndTime] = useState("");
  const [selectedDateSessions, setSelectedDateSessions] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveModalData, setMoveModalData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchSessionDetail();
    fetchSubjects();
    fetchWeekSessions();
  }, [id]);

  useEffect(() => {
    if (selectedMoveDate) {
      fetchSessionsForSelectedDate(new Date(selectedMoveDate));
    } else {
      setSelectedDateSessions([]);
    }
  }, [selectedMoveDate]);

  const fetchSessionDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${config.apiUrl}/study-sessions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setEditData({
          subjectId: data.subjectId?._id || "",
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status,
        });
      }
    } catch (error) {
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.apiUrl}/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (error) {
    }
  };

  const fetchWeekSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/week?offset=0`,{
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Ensure weekSessions is always an array
        const sessions = Array.isArray(data) ? data : data.sessions || [];
        setWeekSessions(sessions);
      }
    } catch (error) {
      setWeekSessions([]);
    }
  };

  const fetchSessionsForSelectedDate = async (date) => {
    try {
      const token = localStorage.getItem("token");
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const response = await fetch(
        `${config.apiUrl}/study-sessions/today?start=${dateStart.toISOString()}&end=${dateEnd.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Check if data is array or nested object
        const sessions = Array.isArray(data) ? data : data.sessions || [];
        setSelectedDateSessions(sessions);
      }
    } catch (error) {
      setSelectedDateSessions([]);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (response.ok) {
        fetchSessionDetail();
        setIsEditing(false);
      }
    } catch (error) {
    }
  };

  const handleCancel = () => {
    setConfirmAction({
      type: "missed",
      title: t("slotDetail.markAsMissedTitle"),
      message: t("slotDetail.markAsMissedMsg"),
      confirmText: t("slotDetail.yesMarkMissed"),
      action: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${config.apiUrl}/study-sessions/${id}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ status: "missed" }),
            }
          );

          if (response.ok) {
            navigate("/calendar");
          }
        } catch (error) {
        }
      },
    });
    setShowConfirmModal(true);
  };

  const handleDelete = () => {
    setConfirmAction({
      type: "delete",
      title: t("slotDetail.deleteTitle"),
      message: t("slotDetail.deleteMsg"),
      confirmText: t("slotDetail.yesDelete"),
      action: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${config.apiUrl}/study-sessions/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            navigate("/calendar");
          }
        } catch (error) {
        }
      },
    });
    setShowConfirmModal(true);
  };

  const canMoveSession = () => {
    // Get current time in Vietnam timezone (UTC+7)
    const vietnamTime = getVietnamTime();

    // Get session date and start time
    const sessionDate = new Date(session.date);
    const [startHour, startMinute] = (session.startTime || "00:00")
      .split(":")
      .map(Number);
    sessionDate.setHours(startHour, startMinute, 0, 0);

    // Check if session start time has passed
    if (vietnamTime > sessionDate) {
      return false;
    }

    // Check if session is completed or missed
    if (session.status === "completed" || session.status === "missed") {
      return false;
    }
    return true;
  };

  const determineTimeSlot = (startTime) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    return "Evening";
  };

  const handleMoveClick = () => {
    if (
      !selectedMoveDate ||
      !selectedTimeSlot ||
      !moveStartTime ||
      !moveEndTime
    ) {
      return;
    }
    if (!canMoveSession()) {
      return;
    }

    const moveDate = new Date(selectedMoveDate);

    const subjectName = session.subjectId?.subjectName || "this session";
    const oldDate = new Date(session.date).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
    });
    const newDate = moveDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
    });

    const modalData = {
      subjectName,
      oldDate,
      oldTimeSlot: session.timeSlot || session.sessionType,
      oldStartTime: session.startTime,
      oldEndTime: session.endTime,
      newDate,
      newTimeSlot: selectedTimeSlot,
      newStartTime: moveStartTime,
      newEndTime: moveEndTime,
      targetDate: moveDate,
      targetTimeSlot: selectedTimeSlot,
    };

    setMoveModalData(modalData);
    setShowMoveModal(true);
  };

  const confirmMove = async () => {
    if (!moveModalData) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: moveModalData.targetDate,
            timeSlot: moveModalData.newTimeSlot,
            startTime: moveModalData.newStartTime,
            endTime: moveModalData.newEndTime,
          }),
        }
      );

      if (response.ok) {
        setShowMoveModal(false);
        setTimeout(() => navigate("/calendar"), 300);
      }
    } catch (error) {
    }
  };

  const getTimeSlotIcon = (timeSlot) => {
    switch (timeSlot) {
      case "Morning":
        return "☀️";
      case "Afternoon":
        return "🌤️";
      case "Evening":
        return "🌙";
      default:
        return "📅";
    }
  };

  const getTimeRangesForSlot = (timeSlot) => {
    switch (timeSlot) {
      case "Morning":
        return [
          { start: "06:00", end: "07:30", label: "6:00 - 7:30 AM" },
          { start: "07:30", end: "09:00", label: "7:30 - 9:00 AM" },
          { start: "09:00", end: "10:30", label: "9:00 - 10:30 AM" },
          { start: "10:30", end: "12:00", label: "10:30 AM - 12:00 PM" },
        ];
      case "Afternoon":
        return [
          { start: "12:00", end: "13:30", label: "12:00 - 1:30 PM" },
          { start: "13:30", end: "15:00", label: "1:30 - 3:00 PM" },
          { start: "15:00", end: "16:30", label: "3:00 - 4:30 PM" },
          { start: "16:30", end: "18:00", label: "4:30 - 6:00 PM" },
        ];
      case "Evening":
        return [
          { start: "18:00", end: "19:30", label: "6:00 - 7:30 PM" },
          { start: "19:30", end: "21:00", label: "7:30 - 9:00 PM" },
          { start: "21:00", end: "22:30", label: "9:00 - 10:30 PM" },
        ];
      default:
        return [];
    }
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const isSlotOccupied = (date, timeSlot) => {
    if (!Array.isArray(selectedDateSessions)) return false;
    if (!timeSlot) return false;
    const normalizedTimeSlot = timeSlot.toLowerCase();
    const occupied = selectedDateSessions.some((s) => {
      const sessionTimeSlot = (s.timeSlot || s.sessionType || "").toLowerCase();
      return sessionTimeSlot === normalizedTimeSlot && s._id !== id;
    });
    return occupied;
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = getVietnamDate();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getSlotsForDate = (date) => {
    if (!date) return [];
    const timeSlots = ["Morning", "Afternoon", "Evening"];
    const now = getVietnamTime();
    const selectedDate = new Date(date);
    selectedDate.setHours(23, 59, 59, 999);

    return timeSlots.map((timeSlot) => ({
      timeSlot,
      occupied: isSlotOccupied(date, timeSlot),
      isCurrent:
        new Date(session.date).toDateString() ===
          new Date(date).toDateString() &&
        (session.timeSlot || session.sessionType) === timeSlot,
      isPast: selectedDate < now && !canMoveSession(),
    }));
  };

  if (!session) {
    return <div className="loading">{t("common.loading")}</div>;
  }

  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const weekDays = [];
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + i);
    weekDays.push(date);
  }

  return (
    <div className="slot-detail-container">
      <SidebarNav />
      <div className="slot-detail-page">
        <header className="slot-detail-header">
          <button className="back-btn" onClick={() => navigate("/calendar")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="slot-detail-title">{t("slotDetail.title")}</h1>
          <div className="header-spacer"></div>
        </header>

        <main className="slot-detail-main">
          {/* Session Info Card */}
          <div className="slot-info-card">
            <div className="slot-info-header">
              <div
                className="slot-info-icon"
                style={{ background: session.subjectId?.color || "#8AC0D5" }}
              >
                {getTimeSlotIcon(session.timeSlot)}
              </div>
              <div className="slot-info-title">
                <h2>
                  {session.timeSlot ? t(`slotDetail.timeSlots.${session.timeSlot.toLowerCase()}`) : ""}{" "}
                  {t("slotDetail.session")}
                </h2>
                <p>
                  {new Date(session.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div className="slot-info-content">
                <div className="slot-info-row">
                  <span className="slot-info-label">
                    {t("slotDetail.subject")}
                  </span>
                  <span className="slot-info-value">
                    📚{" "}
                    {session.subjectId?.subjectName ||
                      t("slotDetail.noSubject")}
                  </span>
                </div>
                <div className="slot-info-row">
                  <span className="slot-info-label">
                    {t("slotDetail.time")}
                  </span>
                  <span className="slot-info-value">
                    🕐 {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div className="slot-info-row">
                  <span className="slot-info-label">
                    {t("slotDetail.status")}
                  </span>
                  <span className={`slot-info-value status-${session.status}`}>
                    {session.status === "completed"
                      ? `✓ ${t("slotDetail.completed")}`
                      : session.status === "missed"
                      ? `❌ ${t("slotDetail.missed")}`
                      : `⏱ ${t("slotDetail.scheduled")}`}
                  </span>
                </div>

                {/* Additional information for completed sessions */}
                {session.status === "completed" && (
                  <>
                    {/* Actual Time & Duration */}
                    {session.actualStartTime && session.actualEndTime && (
                      <div className="slot-info-row highlight">
                        <span className="slot-info-label">
                          {t("slotDetail.actualTime")}
                        </span>
                        <span className="slot-info-value">
                          ⏱️{" "}
                          {new Date(session.actualStartTime).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}{" "}
                          -{" "}
                          {new Date(session.actualEndTime).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    )}
                    {session.actualDuration && (
                      <div className="slot-info-row highlight">
                        <span className="slot-info-label">
                          {t("slotDetail.actualDuration")}
                        </span>
                        <span className="slot-info-value">
                          ⏳ {session.actualDuration} {t("slotDetail.minutes")}
                        </span>
                      </div>
                    )}
                    {/* Focus Level */}
                    {session.focusLevel && (
                      <div className="slot-info-row highlight">
                        <span className="slot-info-label">
                          {t("slotDetail.focusLevel")}
                        </span>
                        <span className="slot-info-value">
                          🎯 {session.focusLevel}/5
                          <span className="focus-stars">
                            {" "}
                            {"⭐".repeat(session.focusLevel)}
                          </span>
                        </span>
                      </div>
                    )}
                    {/* Completed Topics */}
                    {session.completedTopics &&
                      session.completedTopics.length > 0 && (
                        <div className="slot-info-row vertical">
                          <span className="slot-info-label">
                            {t("slotDetail.completedTopics")}
                          </span>
                          <ul className="completed-topics-list">
                            {session.completedTopics.map((topic, idx) => (
                              <li key={idx}>✓ {topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {/* Resources */}
                    {session.resources && session.resources.length > 0 && (
                      <div className="slot-info-row vertical">
                        <span className="slot-info-label">
                          {t("slotDetail.resourcesUsed")}
                        </span>
                        <ul className="resources-list">
                          {session.resources.map((resource, idx) => (
                            <li key={idx}>
                              <span className="resource-type">
                                {resource.type === "textbook"
                                  ? "📚"
                                  : resource.type === "video"
                                  ? "🎥"
                                  : resource.type === "article"
                                  ? "📄"
                                  : resource.type === "practice"
                                  ? "✍️"
                                  : resource.type === "notes"
                                  ? "📝"
                                  : "📌"}
                              </span>
                              <span className="resource-name">
                                {resource.name}
                              </span>
                              {resource.pages && (
                                <span className="resource-pages">
                                  {" "}
                                  (Pages: {resource.pages})
                                </span>
                              )}
                              {resource.url && (
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="resource-link"
                                >
                                  🔗 Link
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Completion Notes */}
                    {session.completionNotes && (
                      <div className="slot-info-row vertical">
                        <span className="slot-info-label">
                          {t("slotDetail.completionNotes")}
                        </span>
                        <div className="completion-notes">
                          {session.completionNotes}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {canMoveSession() && (
                  <button
                    className="slot-edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="btn-icon">✏️</span>
                    <span>{t("slotDetail.editDetails")}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="slot-edit-form">
                <div className="slot-form-group">
                  <label>📚 {t("slotDetail.subject")}</label>
                  <select
                    value={editData.subjectId}
                    onChange={(e) =>
                      setEditData({ ...editData, subjectId: e.target.value })
                    }
                  >
                    <option value="">{t("slotDetail.selectSubject")}</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="slot-form-group">
                  <label>🕐 {t("slotDetail.startTime")}</label>
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) =>
                      setEditData({ ...editData, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="slot-form-group">
                  <label>🕐 {t("slotDetail.endTime")}</label>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) =>
                      setEditData({ ...editData, endTime: e.target.value })
                    }
                  />
                </div>
                <div className="slot-form-actions">
                  <button className="slot-save-btn" onClick={handleSave}>
                    <span className="btn-icon">💾</span>
                    <span>{t("slotDetail.saveChanges")}</span>
                  </button>
                  <button
                    className="slot-cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    <span className="btn-icon">✕</span>
                    <span>{t("slotDetail.cancel")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Move Slot Section */}
          {canMoveSession() && (
            <div className="move-slot-section">
              <h3>{t("slotDetail.moveToAnother")}</h3>
              <p className="section-subtitle">
                {t("slotDetail.selectDateSubtitle")}
              </p>

              {/* Date Selector */}
              <div className="date-selector">
                <label>📅 {t("slotDetail.selectDate")}</label>
                <select
                  value={selectedMoveDate}
                  onChange={(e) => {
                    setSelectedMoveDate(e.target.value);
                    setSelectedTimeSlot("");
                    setMoveStartTime("");
                    setMoveEndTime("");
                  }}
                >
                  <option value="">{t("slotDetail.chooseDate")}</option>
                  {getAvailableDates().map((date, idx) => {
                    const dateValue = `${date.getFullYear()}-${String(
                      date.getMonth() + 1
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(
                      2,
                      "0"
                    )}`;
                    return (
                      <option key={idx} value={dateValue}>
                        {date.toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Time Slot Selector */}
              {selectedMoveDate && (
                <div className="time-slot-selector">
                  <label>⏰ {t("slotDetail.selectTimeSlot")}</label>
                  <div className="slot-options">
                    {getSlotsForDate(new Date(selectedMoveDate)).map(
                      (slot, idx) => {
                        const isDisabled =
                          slot.occupied || slot.isCurrent || slot.isPast;
                        return (
                          <button
                            key={idx}
                            className={`slot-option ${
                              selectedTimeSlot === slot.timeSlot
                                ? "selected"
                                : ""
                            } ${isDisabled ? "disabled" : ""}`}
                            onClick={() => {
                              if (!isDisabled) {
                                setSelectedTimeSlot(slot.timeSlot);
                                setMoveStartTime("");
                                setMoveEndTime("");
                              }
                            }}
                            disabled={isDisabled}
                          >
                            <span className="slot-icon">
                              {getTimeSlotIcon(slot.timeSlot)}
                            </span>
                            <span className="slot-name">
                              {slot.timeSlot ? t(
                                `slotDetail.timeSlots.${slot.timeSlot.toLowerCase()}`
                              ) : ""}
                            </span>
                            <span
                              className={`slot-status ${
                                isDisabled ? "unavailable" : "available"
                              }`}
                            >
                              {slot.occupied
                                ? t("slotDetail.occupied")
                                : slot.isCurrent
                                ? t("slotDetail.current")
                                : slot.isPast
                                ? t("slotDetail.past")
                                : t("slotDetail.available")}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Start Time */}
              {selectedMoveDate && selectedTimeSlot && (
                <div className="time-input-group">
                  <label>🕐 {t("slotDetail.startTime")}:</label>
                  <input
                    type="time"
                    value={moveStartTime}
                    onChange={(e) => setMoveStartTime(e.target.value)}
                  />
                </div>
              )}

              {/* End Time */}
              {selectedMoveDate && selectedTimeSlot && moveStartTime && (
                <div className="time-input-group">
                  <label>🕐 {t("slotDetail.endTime")}:</label>
                  <input
                    type="time"
                    value={moveEndTime}
                    onChange={(e) => setMoveEndTime(e.target.value)}
                    min={moveStartTime}
                  />
                </div>
              )}

              {/* Move Button */}
              {selectedMoveDate &&
                selectedTimeSlot &&
                moveStartTime &&
                moveEndTime && (
                  <button className="move-slot-btn" onClick={handleMoveClick}>
                    🔄 {t("slotDetail.moveToSelected")}
                  </button>
                )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {canMoveSession() && (
              <>
                <button className="cancel-slot-btn" onClick={handleCancel}>
                  {t("slotDetail.markAsMissed")}
                </button>
                <button className="delete-slot-btn" onClick={handleDelete}>
                  {t("slotDetail.deleteSlot")}
                </button>
              </>
            )}
          </div>
        </main>

        <BottomNav />

        {/* Confirm Action Modal */}
        {showConfirmModal && confirmAction && (
          <div
            className="modal-overlay"
            onClick={() => setShowConfirmModal(false)}
          >
            <div
              className="modal-content confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{confirmAction.title}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowConfirmModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-icon">
                  {confirmAction.type === "delete" ? "🗑️" : "⚠️"}
                </div>
                <p className="confirm-message">{confirmAction.message}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-btn modal-cancel"
                  onClick={() => setShowConfirmModal(false)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className={`modal-btn modal-confirm ${
                    confirmAction.type === "delete" ? "danger" : "warning"
                  }`}
                  onClick={() => {
                    confirmAction.action();
                    setShowConfirmModal(false);
                  }}
                >
                  {confirmAction.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Confirmation Modal */}
        {showMoveModal && moveModalData && (
          <div
            className="modal-overlay"
            onClick={() => setShowMoveModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{t("slotDetail.confirmMove")}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowMoveModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-icon">📅</div>
                <p className="modal-subject">
                  {t("slotDetail.subjectLabel")}:{" "}
                  <strong>{moveModalData.subjectName}</strong>
                </p>
                <div className="modal-move-info">
                  <div className="modal-from">
                    <span className="modal-label">{t("slotDetail.from")}:</span>
                    <span className="modal-date">{moveModalData.oldDate}</span>
                    <span className="modal-time">
                      {moveModalData.oldTimeSlot}
                    </span>
                    <span className="modal-specific-time">
                      {moveModalData.oldStartTime} - {moveModalData.oldEndTime}
                    </span>
                  </div>
                  <div className="modal-arrow">→</div>
                  <div className="modal-to">
                    <span className="modal-label">{t("slotDetail.to")}:</span>
                    <span className="modal-date">{moveModalData.newDate}</span>
                    <span className="modal-time">
                      {moveModalData.newTimeSlot}
                    </span>
                    <span className="modal-specific-time">
                      {moveModalData.newStartTime} - {moveModalData.newEndTime}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-btn modal-cancel"
                  onClick={() => setShowMoveModal(false)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className="modal-btn modal-confirm"
                  onClick={confirmMove}
                >
                  {t("slotDetail.confirmMoveBtn")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotDetail;
