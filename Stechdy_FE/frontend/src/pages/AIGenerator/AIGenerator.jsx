import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import config from "../../config";
import "./AIGenerator.css";
import i18n from "../../i18n";

const AIGenerator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form state
  const [subjects, setSubjects] = useState([{ name: "", priority: 3 }]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [sessionDuration, setSessionDuration] = useState("45");
  const [customDuration, setCustomDuration] = useState("45");
  const [busyTimes, setBusyTimes] = useState([
    { day: "", slots: [] },
  ]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  // eslint-disable-next-line no-unused-vars
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [lastScheduleDate, setLastScheduleDate] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteWarningModal, setShowDeleteWarningModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [minStartDate, setMinStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Using backend proxy instead of direct webhook call
  // const n8nWebhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || "http://107.178.213.71:5678/webhook/gen-schedule-v3-lite";
  
  // Check for existing schedule on mount
  useEffect(() => {
    const checkExistingSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${config.apiUrl}/study-sessions/latest`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.date) {
            setHasExistingSchedule(true);
            setLastScheduleDate(data.date);

            // Show confirmation modal
            setShowDeleteConfirmModal(true);
          }
        }
      } catch (error) {
        console.error("Error checking existing schedule:", error);
      }
    };

    checkExistingSchedule();
  }, []);

  // Handle delete old schedule confirmation
  const handleDeleteOldSchedule = () => {
    // Show warning modal first
    setShowDeleteConfirmModal(false);
    setShowDeleteWarningModal(true);
  };

  const confirmDeleteOldSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.apiUrl}/study-sessions/delete-all`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setShowDeleteWarningModal(false);
        setShowDeleteSuccessModal(true);
        setHasExistingSchedule(false);
        setMinStartDate(new Date().toISOString().split("T")[0]);
        setStartDate(new Date().toISOString().split("T")[0]);
      } else {
        displayToast("Failed to delete old schedule", "error");
        setShowDeleteWarningModal(false);
      }
    } catch (error) {
      displayToast("Error deleting old schedule", "error");
      setShowDeleteWarningModal(false);
    }
  };

  const handleKeepOldSchedule = () => {
    // Set minimum start date to day after last schedule
    const lastDate = new Date(lastScheduleDate);
    lastDate.setDate(lastDate.getDate() + 1);
    const nextDay = lastDate.toISOString().split("T")[0];

    setMinStartDate(nextDay);
    setStartDate(nextDay);
    setShowDeleteConfirmModal(false);
  };

  // Subject handlers
  const addSubject = () => {
    setSubjects([...subjects, { name: "", priority: 3 }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  // Busy time handlers
  const addBusyTime = () => {
    setBusyTimes([...busyTimes, { day: "", slots: [] }]);
  };

  const removeBusyTime = (index) => {
    if (busyTimes.length > 1) {
      setBusyTimes(busyTimes.filter((_, i) => i !== index));
    }
  };

  const updateBusyTimeDay = (index, day) => {
    const newBusyTimes = [...busyTimes];
    newBusyTimes[index].day = day;
    // Reset slots when changing day
    newBusyTimes[index].slots = [];
    setBusyTimes(newBusyTimes);
  };

  // Check if all days are selected
  const allDaysSelected = () => {
    const selectedDays = busyTimes.filter(bt => bt.day !== "").map(bt => bt.day);
    return selectedDays.length >= 7;
  };

  const toggleBusyTimeSlot = (busyIndex, slot) => {
    const newBusyTimes = [...busyTimes];
    const slots = newBusyTimes[busyIndex].slots;

    if (slots.includes(slot)) {
      newBusyTimes[busyIndex].slots = slots.filter((s) => s !== slot);
    } else {
      newBusyTimes[busyIndex].slots = [...slots, slot];
    }

    setBusyTimes(newBusyTimes);
  };

  // Transform form data to n8n format
  const transformDataForWebhook = () => {
    const finalEndDate = endDate || (() => {
      const end = new Date(startDate);
      end.setDate(end.getDate() + 30);
      return end.toISOString().split("T")[0];
    })();

    const sessionMinutes =
      sessionDuration === "custom"
        ? parseInt(customDuration) || 60
        : parseInt(sessionDuration);
    const durationHours = Math.max(sessionMinutes / 60, 0.5);

    // Transform busy times
    const transformedBusyTimes = [];
    busyTimes.forEach((bt) => {
      if (bt.day && bt.slots.length > 0) {
        bt.slots.forEach((slot) => {
          let startTime, endTime, label;
          if (slot === "morning") {
            startTime = "08:00";
            endTime = "12:00";
            label = "Morning";
          } else if (slot === "afternoon") {
            startTime = "14:00";
            endTime = "17:00";
            label = "Afternoon";
          } else if (slot === "evening") {
            startTime = "19:00";
            endTime = "22:00";
            label = "Evening";
          }

          transformedBusyTimes.push({
            day: bt.day.toLowerCase(),
            start: startTime,
            end: endTime,
            start_time: startTime,
            end_time: endTime,
            label: label,
          });
        });
      }
    });

    const validSubjects = subjects.filter((s) => s.name.trim() !== "");

    // Check if evening is available (not in busy times)
    const eveningBusy = transformedBusyTimes.some(bt => bt.label === "Evening");
    // If evening is free, we can have 3 slots per day (morning, afternoon, evening)
    const slotsPerDay = eveningBusy ? 2 : 3;
    const maxSubjectsPerDay = Math.min(Math.max(validSubjects.length, slotsPerDay), slotsPerDay);

    return {
      start_date: startDate,
      end_date: finalEndDate,
      duration: durationHours,
      session_duration_hours: durationHours,
      subjects: validSubjects.map((s) => ({
        name: s.name,
        priority: s.priority || 3,
      })),
      busy_times: transformedBusyTimes,
      lunch_start: "12:00",
      lunch_end: "13:00",
      dinner_start: "17:00",
      dinner_end: "18:00",
      max_subjects_per_day: maxSubjectsPerDay,
      include_saturday: true,
      include_evening: !eveningBusy,
      slots_per_day: slotsPerDay,
    };
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const validSubjects = subjects.filter((s) => s.name.trim() !== "");
    if (validSubjects.length === 0) {
      displayToast("Please add at least one subject", "error");
      return;
    }

    if (!startDate) {
      displayToast("Please select a start date", "error");
      return;
    }

    // Validate end date is not before start date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      displayToast("End date cannot be before start date", "error");
      return;
    }

    // Validate start date is not before minimum allowed date
    if (new Date(startDate) < new Date(minStartDate)) {
      displayToast(
        `Start date must be ${new Date(minStartDate).toLocaleDateString()} or later`,
        "error"
      );
      return;
    }

    setIsGenerating(true);

    try {
      const webhookData = transformDataForWebhook();
      const token = localStorage.getItem("token");
      
      // Use backend proxy instead of direct webhook call to avoid Mixed Content issues
      const response = await fetch(`${process.env.REACT_APP_API_URL}/study-sessions/generate-ai-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(webhookData),
      });

      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(text || `Server error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(
          result.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      console.log("Response:", result);

      // Extract schedule data - handle various response formats from n8n
      let scheduleData = null;

      // Case 1: n8n returns array with response object [{success, data: {schedule: [...]}}]
      if (Array.isArray(result) && result.length > 0) {
        const firstItem = result[0];
        if (firstItem?.data?.schedule && Array.isArray(firstItem.data.schedule)) {
          scheduleData = firstItem.data;
          console.log("Extracted from array[0].data:", scheduleData);
        } else if (firstItem?.schedule && Array.isArray(firstItem.schedule)) {
          scheduleData = firstItem;
          console.log("Extracted from array[0]:", scheduleData);
        } else {
          // Assume the array itself is the schedule
          scheduleData = { schedule: result };
        }
      }
      // Case 2: Direct response {success, data: {schedule: [...]}}
      else if (result.success && result.data?.schedule) {
        scheduleData = result.data;
        console.log("Extracted from result.data:", scheduleData);
      }
      // Case 3: Direct {schedule: [...]}
      else if (result.schedule && Array.isArray(result.schedule)) {
        scheduleData = result;
        console.log("Extracted direct schedule:", scheduleData);
      }

      console.log("Final scheduleData:", scheduleData);
      console.log("Schedule array length:", scheduleData?.schedule?.length);

      if (scheduleData && scheduleData.schedule && Array.isArray(scheduleData.schedule) && scheduleData.schedule.length > 0) {
        // Save to localStorage for editing in ScheduleEditor
        localStorage.setItem("studySchedule", JSON.stringify(scheduleData));
        localStorage.setItem("studyScheduleInput", JSON.stringify(webhookData));

        // Show success message - user will save to DB after editing
        displayToast(
          `Schedule generated with ${scheduleData.schedule.length} days! Review and edit before saving.`,
          "success"
        );

        // Increment generation count
        const currentCount = parseInt(
          localStorage.getItem("ai_generation_count") || "0",
          10
        );
        localStorage.setItem("ai_generation_count", (currentCount + 1).toString());

        // Redirect to schedule editor page to review/edit before final save
        setTimeout(() => {
          navigate("/schedule-editor");
        }, 1500);
      } else {
        console.error("Unexpected response structure:", JSON.stringify(result, null, 2));
        throw new Error("Unexpected response format. Check browser console for details.");
      }
    } catch (error) {
      console.error("Error:", error);

      let userMessage = error.message;
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        userMessage =
          "Cannot connect to AI schedule generation service. Please check your internet connection and try again.";
      } else if (error.message.includes("500")) {
        userMessage = "Server error during schedule generation. Please try again.";
      }

      // Show error modal instead of toast for schedule generation errors
      setShowErrorModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const displayToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="ai-generator-container">
      <SidebarNav />

      <div className="ai-generator-wrapper">
        {/* Header */}
        <h1 className="ai-generator-page-title">{t("ai.title") || "AI Schedule Generator"}</h1>

        {/* Main Content with 2-column layout */}
        <main className="ai-generator-content">
          <form className="schedule-form" onSubmit={handleSubmit}>
            <div className="ai-generator-content-grid">
              {/* Left Column - Subjects & Date */}
              <div className="ai-generator-left-column">
                {/* Subjects Section */}
                <section className="ag-form-section">
                  <h2 className="ag-section-title">
                    <i className="fas fa-book"></i>
                    {t("ai.subjects") || "Subjects"}
                  </h2>

                  <div className="subjects-list">
                    {subjects.map((subject, index) => (
                      <div key={index} className="subject-item">
                        <div className="subject-row">
                          <input
                            type="text"
                            className="subject-input"
                            placeholder={t("ai.subjectName") || "Subject name..."}
                            value={subject.name}
                            onChange={(e) =>
                              updateSubject(index, "name", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="priority-group">
                          <div className="priority-header">
                            <label className="priority-label">
                              {t("ai.priority") || "Priority"}
                            </label>
                            {subjects.length > 1 && (
                              <button
                                type="button"
                                className="ag-btn-remove"
                                onClick={() => removeSubject(index)}
                                title="Remove subject"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                          <div className="priority-pills">
                            {[1, 2, 3, 4, 5].map((priority) => (
                              <button
                                key={priority}
                                type="button"
                                className={`pill ${subject.priority === priority ? "active" : ""
                                  }`}
                                onClick={() =>
                                  updateSubject(index, "priority", priority)
                                }
                              >
                                {priority}
                              </button>
                            ))}
                          </div>
                          <span className="priority-hint">
                            {subject.priority === 1 && "Highest"}
                            {subject.priority === 2 && "High"}
                            {subject.priority === 3 && "Medium"}
                            {subject.priority === 4 && "Low"}
                            {subject.priority === 5 && "Lowest"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="ag-btn-add"
                    onClick={addSubject}
                  >
                    <i className="fas fa-plus"></i>
                    {t("ai.addSubject") || "Add Subject"}
                  </button>
                </section>

                {/* Date Range Section */}
                <section className="ag-form-section">
                  <h2 className="ag-section-title">
                    <i className="fas fa-calendar-alt"></i>
                    {t("ai.dateRange") || "Date Range"}
                  </h2>

                  <div className="date-inputs">
                    <div className="ag-input-group">
                      <label htmlFor="start-date">
                        {t("ai.startDate") || "Start Date"}
                      </label>
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          id="start-date"
                          className="date-input"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={minStartDate}
                          required
                        />
                        <i className="fas fa-calendar-alt date-icon"></i>
                      </div>
                    </div>

                    <div className="ag-input-group">
                      <label htmlFor="end-date">
                        {t("ai.endDate") || "End Date (Optional)"}
                      </label>
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          id="end-date"
                          className="date-input"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split("T")[0]}
                        />
                        <i className="fas fa-calendar-alt date-icon"></i>
                      </div>
                      <span className="input-hint">
                        {t("ai.endDateHint") || "Leave empty for 30 days from start"}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column - Duration & Busy Times */}
              <div className="ai-generator-right-column">
                {/* Study Duration Section */}
                <section className="ag-form-section">
                  <h2 className="ag-section-title">
                    <i className="fas fa-clock"></i>
                    {t("ai.studyDuration") || "Study Session Duration"}
                  </h2>

                  <div className="duration-pills">
                    {[
                      { value: "30", label: "30 min" },
                      { value: "45", label: "45 min" },
                      { value: "60", label: "1 hour" },
                      { value: "90", label: "1.5 hours" },
                      { value: "custom", label: "Custom" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`pill ${sessionDuration === option.value ? "active" : ""
                          }`}
                        onClick={() => setSessionDuration(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {sessionDuration === "custom" && (
                    <div className="custom-duration">
                      <input
                        type="number"
                        className="custom-input"
                        placeholder="Minutes..."
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        min="15"
                        max="240"
                        step="15"
                      />
                      <span className="input-hint">
                        {t("ai.customHint") || "15-240 minutes"}
                      </span>
                    </div>
                  )}
                </section>

                {/* Busy Times Section */}
                <section className="ag-form-section">
                  <h2 className="ag-section-title">
                    <i className="fas fa-calendar-times"></i>
                    {t("ai.busyTimes") || "Busy Times (Optional)"}
                  </h2>

                  <div className="busy-times-list">
                    {busyTimes.map((busyTime, index) => (
                      <div key={index} className="busy-time-item">
                        <div className="busy-time-row">
                          <select
                            className="day-select"
                            value={busyTime.day}
                            onChange={(e) =>
                              updateBusyTimeDay(index, e.target.value)
                            }
                          >
                            <option value="">{t("ai.selectDay") || "Select day..."}</option>
                            {[
                              { value: "monday", label: "Monday" },
                              { value: "tuesday", label: "Tuesday" },
                              { value: "wednesday", label: "Wednesday" },
                              { value: "thursday", label: "Thursday" },
                              { value: "friday", label: "Friday" },
                              { value: "saturday", label: "Saturday" },
                              { value: "sunday", label: "Sunday" }
                            ].map(day => {
                              const isSelected = busyTimes.some((bt, i) => i !== index && bt.day === day.value);
                              return (
                                <option
                                  key={day.value}
                                  value={day.value}
                                  disabled={isSelected}
                                >
                                  {day.label}{isSelected ? " (✓)" : ""}
                                </option>
                              );
                            })}
                          </select>

                          {busyTimes.length > 1 && (
                            <button
                              type="button"
                              className="ag-btn-remove"
                              onClick={() => removeBusyTime(index)}
                              title="Remove busy time"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>

                        {busyTime.day && (
                          <div className="time-slot-selector">
                            <div className="slot-options">
                              {[
                                { value: "morning", label: "Morning", icon: "☀️" },
                                { value: "afternoon", label: "Afternoon", icon: "🌤️" },
                                { value: "evening", label: "Evening", icon: "🌙" },
                              ].map((slot) => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  className={`slot-option ${busyTime.slots.includes(slot.value)
                                    ? "selected"
                                    : ""
                                    }`}
                                  onClick={() => toggleBusyTimeSlot(index, slot.value)}
                                >
                                  <span className="slot-icon">{slot.icon}</span>
                                  <span className="slot-name">{slot.label}</span>
                                  <span
                                    className={`slot-status ${busyTime.slots.includes(slot.value)
                                      ? "unavailable"
                                      : "available"
                                      }`}
                                  >
                                    {busyTime.slots.includes(slot.value)
                                      ? "Busy"
                                      : "Available"}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="ag-btn-add"
                    onClick={addBusyTime}
                    disabled={allDaysSelected()}
                    style={{
                      opacity: allDaysSelected() ? 0.5 : 1,
                      cursor: allDaysSelected() ? "not-allowed" : "pointer"
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    {t("ai.addBusyTime") || "Add Busy Time"}
                  </button>
                </section>
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <button
              type="submit"
              className="ag-btn-generate"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t("ai.generating") || "Generating..."}
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  {t("ai.generateSchedule") || "Generate Schedule"}
                </>
              )}
            </button>
          </form>
        </main>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`ag-toast show ${toastType}`}>
          <div className="ag-toast-icon">
            <i
              className={
                toastType === "success"
                  ? "fas fa-check-circle"
                  : toastType === "error"
                    ? "fas fa-times-circle"
                    : "fas fa-info-circle"
              }
            ></i>
          </div>
          <div className="ag-toast-content">
            <div className="ag-toast-title">
              {toastType === "success"
                ? "Success"
                : toastType === "error"
                  ? "Error"
                  : "Info"}
            </div>
            <div className="ag-toast-message">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="ag-modal-overlay">
          <div className="ag-modal-content confirm-modal">
            <div className="ag-modal-header">
              <div className="modal-header-content">
                <img
                  src={`${process.env.PUBLIC_URL}/LogoAIStechdy.png?v=${Date.now()}`}
                  alt="S'Techdy"
                  className="landing-new__logo-img"
                />
                <h2>{i18n.language === "vi" ? "Phát hiện lịch học cũ" : "Existing Schedule Detected"}</h2>
              </div>
            </div>
            <div className="ag-modal-body">
              <p className="modal-main-text">
                {i18n.language === "vi" ? "Bạn đã có lịch học đến" : "You already have a study schedule until"}{" "}
                <strong className="highlight-date">
                  {lastScheduleDate
                    ? new Date(lastScheduleDate).toLocaleDateString(
                      i18n.language === "vi" ? "vi-VN" : "en-US",
                      {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }
                    )
                    : ""}
                </strong>
                .
              </p>
              <p className="modal-question">
                {i18n.language === "vi"
                  ? "Bạn có muốn xóa lịch cũ để tạo lịch mới, hay tiếp tục từ ngày kết thúc lịch cũ?"
                  : "Do you want to delete your old schedule to create a new one, or continue from when the old schedule ends?"}
              </p>
            </div>
            <div className="ag-modal-footer">
              <button
                className="ag-btn-modal ag-btn-danger"
                onClick={handleDeleteOldSchedule}
              >
                <i className="fas fa-trash"></i>
                <span>{i18n.language === "vi" ? "Xóa lịch cũ & Tạo mới" : "Delete Old Schedule"}</span>
              </button>
              <button
                className="ag-btn-modal ag-btn-primary"
                onClick={handleKeepOldSchedule}
              >
                <i className="fas fa-calendar-plus"></i>
                <span>
                  {i18n.language === "vi"
                    ? `Tiếp tục từ ${lastScheduleDate ? new Date(new Date(lastScheduleDate).setDate(new Date(lastScheduleDate).getDate() + 1)).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }) : ""}`
                    : `Continue from ${lastScheduleDate ? new Date(new Date(lastScheduleDate).setDate(new Date(lastScheduleDate).getDate() + 1)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarningModal && (
        <div className="ag-modal-overlay" onClick={() => setShowDeleteWarningModal(false)}>
          <div className="ag-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="ag-modal-header">
              <div className="modal-header-content">
                <img
                  src={`${process.env.PUBLIC_URL}/LogoAIStechdy.png?v=${Date.now()}`}
                  alt="S'Techdy"
                  className="landing-new__logo-img"
                />
                <h2>{i18n.language === "vi" ? "Xác nhận xóa lịch học" : "Confirm Delete Schedule"}</h2>
              </div>
            </div>
            <div className="ag-modal-body">
              <p className="modal-main-text">
                {i18n.language === "vi" 
                  ? "Bạn có chắc chắn muốn xóa tất cả lịch học cũ không?" 
                  : "Are you sure you want to delete all old schedules?"}
              </p>
              <p className="modal-question warning-text">
                {i18n.language === "vi" 
                  ? "⚠️ Hành động này không thể hoàn tác!" 
                  : "⚠️ This action cannot be undone!"}
              </p>
            </div>
            <div className="ag-modal-footer">
              <button
                className="ag-btn-modal ag-btn-secondary"
                onClick={() => setShowDeleteWarningModal(false)}
              >
                <i className="fas fa-times"></i>
                <span>{i18n.language === "vi" ? "Hủy" : "Cancel"}</span>
              </button>
              <button
                className="ag-btn-modal ag-btn-danger"
                onClick={confirmDeleteOldSchedule}
              >
                <i className="fas fa-trash"></i>
                <span>{i18n.language === "vi" ? "Xác nhận xóa" : "Confirm Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="ag-modal-overlay" onClick={() => setShowDeleteSuccessModal(false)}>
          <div className="ag-modal-content success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ag-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon-wrapper success">
                  <i className="fas fa-check-circle modal-icon"></i>
                </div>
                <h2>{i18n.language === "vi" ? "Xóa thành công!" : "Successfully Deleted!"}</h2>
              </div>
            </div>
            <div className="ag-modal-body">
              <p className="modal-main-text">
                {i18n.language === "vi" 
                  ? "Tất cả lịch học cũ đã được xóa thành công. Bạn có thể tạo lịch học mới ngay bây giờ." 
                  : "All old schedules have been successfully deleted. You can now create a new schedule."}
              </p>
            </div>
            <div className="ag-modal-footer">
              <button
                className="ag-btn-modal ag-btn-primary"
                onClick={() => setShowDeleteSuccessModal(false)}
              >
                <i className="fas fa-check"></i>
                <span>{i18n.language === "vi" ? "Đóng" : "Close"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Loading Modal - Updated */}
      {isGenerating && (
        <div className="ag-loading-overlay">
          <div className="ag-loading-modal">
            <div className="ag-loading-header">
              <div className="ag-loading-icon-wrapper">
                <div className="ag-loading-ring"></div>
                <i className="fas fa-robot ag-loading-icon"></i>
              </div>
              <h2 className="ag-loading-title">AI đang tạo lịch học...</h2>
              <p className="ag-loading-subtitle">Phân tích và tối ưu hóa lịch học cá nhân hóa cho bạn</p>
            </div>
            
            <div className="ag-loading-body">
              <div className="ag-loading-progress">
                <div className="ag-progress-bar">
                  <div className="ag-progress-fill"></div>
                </div>
                <span className="ag-progress-text ag-progress-animated">0%</span>
              </div>
              
              <div className="ag-loading-steps">
                <div className="ag-step">
                  <div className="ag-step-icon">📚</div>
                  <div className="ag-step-content">
                    <div className="ag-step-title">Phân tích môn học</div>
                    <div className="ag-step-bar">
                      <div className="ag-step-fill step-1"></div>
                    </div>
                  </div>
                </div>
                
                <div className="ag-step">
                  <div className="ag-step-icon">⏰</div>
                  <div className="ag-step-content">
                    <div className="ag-step-title">Tối ưu thời gian</div>
                    <div className="ag-step-bar">
                      <div className="ag-step-fill step-2"></div>
                    </div>
                  </div>
                </div>
                
                <div className="ag-step">
                  <div className="ag-step-icon">🎯</div>
                  <div className="ag-step-content">
                    <div className="ag-step-title">Tạo lịch học</div>
                    <div className="ag-step-bar">
                      <div className="ag-step-fill step-3"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="ag-loading-hint">
                Điều này chỉ mất vài giây... Hãy thư giãn và chờ AI làm việc nhé! ✨
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="ag-loading-overlay">
          <div className="ag-error-modal">
            <div className="ag-error-header">
              <div className="ag-error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2 className="ag-error-title">Đã xảy ra lỗi!</h2>
              <p className="ag-error-subtitle">Không thể tạo lịch học lúc này</p>
            </div>
            
            <div className="ag-error-body">
              <div className="ag-error-message">
                <p>Có lỗi xảy ra trong quá trình tạo lịch học. Điều này có thể do:</p>
                <ul>
                  <li>Mất kết nối internet</li>
                  <li>Server đang bận</li>
                  <li>Dữ liệu nhập vào không hợp lệ</li>
                </ul>
              </div>
              
              <div className="ag-error-actions">
                <button 
                  className="ag-error-btn ag-error-retry"
                  onClick={() => {
                    setShowErrorModal(false);
                    handleSubmit();
                  }}
                >
                  <i className="fas fa-redo"></i>
                  Thử lại
                </button>
                <button 
                  className="ag-error-btn ag-error-cancel"
                  onClick={() => setShowErrorModal(false)}
                >
                  <i className="fas fa-times"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};

export default AIGenerator;