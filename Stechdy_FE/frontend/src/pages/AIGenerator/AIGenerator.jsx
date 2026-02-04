import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import config from "../../config";
import "./AIGenerator.css";
import i18n from "../../i18n";
import veryHappyImg from "../../assets/Veryhappy.png";

const AIGenerator = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form state
  const [subjects, setSubjects] = useState([{ name: "", priority: 3 }]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [sessionDuration, setSessionDuration] = useState("45");
  const [customDuration, setCustomDuration] = useState("45");
  const [busyTimes, setBusyTimes] = useState([{ day: "", slots: [] }]);

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
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedDaysCount, setGeneratedDaysCount] = useState(0);
  const [minStartDate, setMinStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Usage tracking for free users
  const [remainingGenerations, setRemainingGenerations] = useState(4);
  const [isPremium, setIsPremium] = useState(null); // null = loading, false = free, true = premium
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const checkExistingSchedule = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Check user premium status
        const userResponse = await fetch(`${config.apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Check premium status - can be isPremium boolean OR premiumStatus string  
          const userIsPremium = userData.isPremium === true || userData.premiumStatus === 'premium' || userData.user?.isPremium === true || userData.user?.premiumStatus === 'premium';
          setIsPremium(userIsPremium);
        } else {
          setIsPremium(false); // Default to free if API fails
        }

        // Load remaining generations from localStorage for free users
        const today = new Date().toDateString();
        const savedData = localStorage.getItem(`aiGeneratorUsage_${today}`);
        if (savedData) {
          const { remaining } = JSON.parse(savedData);
          setRemainingGenerations(remaining);
        }

        const response = await fetch(`${config.apiUrl}/study-sessions/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        },
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
    const selectedDays = busyTimes
      .filter((bt) => bt.day !== "")
      .map((bt) => bt.day);
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
    const finalEndDate =
      endDate ||
      (() => {
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
    const eveningBusy = transformedBusyTimes.some(
      (bt) => bt.label === "Evening",
    );
    // If evening is free, we can have 3 slots per day (morning, afternoon, evening)
    const slotsPerDay = eveningBusy ? 2 : 3;
    const maxSubjectsPerDay = Math.min(
      Math.max(validSubjects.length, slotsPerDay),
      slotsPerDay,
    );

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

    // Check if free user has remaining generations
    if (isPremium === false && remainingGenerations <= 0) {
      setShowUpgradeModal(true);
      return;
    }

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
        "error",
      );
      return;
    }

    setIsGenerating(true);

    try {
      const webhookData = transformDataForWebhook();
      const token = localStorage.getItem("token");

      // Use backend proxy instead of direct webhook call to avoid Mixed Content issues
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/study-sessions/generate-ai-schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(webhookData),
        },
      );

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
          result.error?.message || `HTTP error! status: ${response.status}`,
        );
      }

      // Extract schedule data - handle various response formats from n8n
      let scheduleData = null;

      // Case 1: n8n returns array with response object [{success, data: {schedule: [...]}}]
      if (Array.isArray(result) && result.length > 0) {
        const firstItem = result[0];
        if (
          firstItem?.data?.schedule &&
          Array.isArray(firstItem.data.schedule)
        ) {
          scheduleData = firstItem.data;
        } else if (firstItem?.schedule && Array.isArray(firstItem.schedule)) {
          scheduleData = firstItem;
        } else {
          // Assume the array itself is the schedule
          scheduleData = { schedule: result };
        }
      }
      // Case 2: Direct response {success, data: {schedule: [...]}}
      else if (result.success && result.data?.schedule) {
        scheduleData = result.data;
      }
      // Case 3: Direct {schedule: [...]}
      else if (result.schedule && Array.isArray(result.schedule)) {
        scheduleData = result;
      }

      if (
        scheduleData &&
        scheduleData.schedule &&
        Array.isArray(scheduleData.schedule) &&
        scheduleData.schedule.length > 0
      ) {
        // Save to localStorage for editing in ScheduleEditor
        localStorage.setItem("studySchedule", JSON.stringify(scheduleData));
        localStorage.setItem("studyScheduleInput", JSON.stringify(webhookData));

        // Increment generation count
        const currentCount = parseInt(
          localStorage.getItem("ai_generation_count") || "0",
          10,
        );
        localStorage.setItem(
          "ai_generation_count",
          (currentCount + 1).toString(),
        );

        // Show success modal
        setGeneratedDaysCount(scheduleData.schedule.length);
        setShowSuccessModal(true);

        // Update remaining generations for free users
        if (isPremium === false) {
          const newRemaining = remainingGenerations - 1;
          setRemainingGenerations(newRemaining);
          
          // Save to localStorage
          const today = new Date().toDateString();
          localStorage.setItem(`aiGeneratorUsage_${today}`, JSON.stringify({
            remaining: newRemaining,
            date: today
          }));
        }
      } else {
        console.error(
          "Unexpected response structure:",
          JSON.stringify(result, null, 2),
        );
        throw new Error(
          "Unexpected response format. Check browser console for details.",
        );
      }
    } catch (error) {
      console.error("Error:", error);

      let userMessage = error.message;
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        userMessage = "Cannot connect to AI schedule generation service. Please check your internet connection and try again.";
      } else if (error.message.includes("500")) {
        userMessage = "Server error during schedule generation. Please try again.";
      }

      // Show error modal instead of toast for schedule generation errors
      setErrorMessage(userMessage);
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
        <div className="ai-generator-header">
          <h1 className="ai-generator-page-title">
            {t("ai.title") || "AI Schedule Generator"}
          </h1>
        </div>

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
                            placeholder={
                              t("ai.subjectName") || "Subject name..."
                            }
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
                                className={`pill ${
                                  subject.priority === priority ? "active" : ""
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
                            {subject.priority === 1 && (t("ai.priorityHighest") || "Highest")}
                            {subject.priority === 2 && (t("ai.priorityHigh") || "High")}
                            {subject.priority === 3 && (t("ai.priorityMedium") || "Medium")}
                            {subject.priority === 4 && (t("ai.priorityLow") || "Low")}
                            {subject.priority === 5 && (t("ai.priorityLowest") || "Lowest")}
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
                          min={
                            startDate || new Date().toISOString().split("T")[0]
                          }
                        />
                        <i className="fas fa-calendar-alt date-icon"></i>
                      </div>
                      <span className="input-hint">
                        {t("ai.endDateHint") ||
                          "Leave empty for 30 days from start"}
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
                      { value: "30", label: t("ai.duration30") || "30 min" },
                      { value: "45", label: t("ai.duration45") || "45 min" },
                      { value: "60", label: t("ai.duration60") || "1 hour" },
                      { value: "90", label: t("ai.duration90") || "1.5 hours" },
                      { value: "custom", label: t("ai.durationCustom") || "Custom" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`pill ${
                          sessionDuration === option.value ? "active" : ""
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
                            <option value="">
                              {t("ai.selectDay") || "Select day..."}
                            </option>
                            {[
                              { value: "monday", label: t("ai.monday") || "Monday" },
                              { value: "tuesday", label: t("ai.tuesday") || "Tuesday" },
                              { value: "wednesday", label: t("ai.wednesday") || "Wednesday" },
                              { value: "thursday", label: t("ai.thursday") || "Thursday" },
                              { value: "friday", label: t("ai.friday") || "Friday" },
                              { value: "saturday", label: t("ai.saturday") || "Saturday" },
                              { value: "sunday", label: t("ai.sunday") || "Sunday" },
                            ].map((day) => {
                              const isSelected = busyTimes.some(
                                (bt, i) => i !== index && bt.day === day.value,
                              );
                              return (
                                <option
                                  key={day.value}
                                  value={day.value}
                                  disabled={isSelected}
                                >
                                  {day.label}
                                  {isSelected ? " (✓)" : ""}
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
                                {
                                  value: "morning",
                                  label: t("ai.slotMorning") || "Morning",
                                  icon: "☀️",
                                },
                                {
                                  value: "afternoon",
                                  label: t("ai.slotAfternoon") || "Afternoon",
                                  icon: "🌤️",
                                },
                                {
                                  value: "evening",
                                  label: t("ai.slotEvening") || "Evening",
                                  icon: "🌙",
                                },
                              ].map((slot) => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  className={`slot-option ${
                                    busyTime.slots.includes(slot.value)
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    toggleBusyTimeSlot(index, slot.value)
                                  }
                                >
                                  <span className="slot-icon">{slot.icon}</span>
                                  <span className="slot-name">
                                    {slot.label}
                                  </span>
                                  <span
                                    className={`slot-status ${
                                      busyTime.slots.includes(slot.value)
                                        ? "unavailable"
                                        : "available"
                                    }`}
                                  >
                                    {busyTime.slots.includes(slot.value)
                                      ? (t("ai.statusBusy") || "Busy")
                                      : (t("ai.statusAvailable") || "Available")}
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
                      cursor: allDaysSelected() ? "not-allowed" : "pointer",
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    {t("ai.addBusyTime") || "Add Busy Time"}
                  </button>
                </section>
              </div>
            </div>

            {/* Usage Counter for Free Users */}
            {(isPremium === false || isPremium === null) && (
              <div className="ai-usage-counter-bottom">
                <span className="usage-text">{remainingGenerations}/4 {t("aiGenerator.remainingGenerations")}</span>
                <button className="upgrade-btn" onClick={() => navigate('/pricing')}>
                  ✨ {t("aiGenerator.premium")}
                </button>
              </div>
            )}

            {/* Submit Button - Full Width */}
            <button
              type="submit"
              className="ag-btn-generate"
              disabled={isGenerating || (isPremium === false && remainingGenerations <= 0)}
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
                <h2>
                  {i18n.language === "vi"
                    ? "Phát hiện lịch học cũ"
                    : "Existing Schedule Detected"}
                </h2>
              </div>
            </div>
            <div className="ag-modal-body">
              <p className="modal-main-text">
                {i18n.language === "vi"
                  ? "Bạn đã có lịch học đến"
                  : "You already have a study schedule until"}{" "}
                <strong className="highlight-date">
                  {lastScheduleDate
                    ? new Date(lastScheduleDate).toLocaleDateString(
                        i18n.language === "vi" ? "vi-VN" : "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
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
                <span>
                  {i18n.language === "vi"
                    ? "Xóa lịch cũ & Tạo mới"
                    : "Delete Old Schedule"}
                </span>
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
        <div
          className="ag-modal-overlay"
          onClick={() => setShowDeleteWarningModal(false)}
        >
          <div
            className="ag-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ag-modal-header">
              <div className="modal-header-content">
                <img
                  src={`${process.env.PUBLIC_URL}/LogoAIStechdy.png?v=${Date.now()}`}
                  alt="S'Techdy"
                  className="landing-new__logo-img"
                />
                <h2>
                  {i18n.language === "vi"
                    ? "Xác nhận xóa lịch học"
                    : "Confirm Delete Schedule"}
                </h2>
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
                <span>
                  {i18n.language === "vi" ? "Xác nhận xóa" : "Confirm Delete"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div
          className="ag-modal-overlay"
          onClick={() => setShowDeleteSuccessModal(false)}
        >
          <div
            className="ag-modal-content success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ag-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon-wrapper success">
                  <img src={veryHappyImg} alt="Success" className="modal-icon" />
                </div>
                <h2>
                  {i18n.language === "vi"
                    ? "Xóa thành công!"
                    : "Successfully Deleted!"}
                </h2>
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
              <p className="ag-loading-subtitle">
                Phân tích và tối ưu hóa lịch học cá nhân hóa cho bạn
              </p>
            </div>

            <div className="ag-loading-body">
              <div className="ag-loading-progress">
                <div className="ag-progress-bar">
                  <div className="ag-progress-fill"></div>
                </div>
                <span className="ag-progress-text ag-progress-animated"></span>
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
                Điều này chỉ mất vài giây... Hãy thư giãn và chờ AI làm việc
                nhé! ✨
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="ag-loading-overlay">
          <div className="ag-success-modal">
            <div className="ag-success-header">
              <div className="ag-success-icon">
                <img src={veryHappyImg} alt="Success" />
              </div>
              <h2 className="ag-success-title">
                {i18n.language === "vi"
                  ? "Tạo lịch thành công!"
                  : "Schedule Created Successfully!"}
              </h2>
              <p className="ag-success-subtitle">
                {i18n.language === "vi"
                  ? `Đã tạo ${generatedDaysCount} ngày học`
                  : `Generated ${generatedDaysCount} study days`}
              </p>
            </div>

            <div className="ag-success-body">
              <div className="ag-success-message">
                <p>
                  {i18n.language === "vi"
                    ? "Lịch học AI đã được tạo thành công! Bạn có thể:"
                    : "Your AI schedule has been created successfully! You can:"}
                </p>
                <ul>
                  <li>
                    {i18n.language === "vi"
                      ? "Xem và chỉnh sửa lịch học"
                      : "Review and edit the schedule"}
                  </li>
                  <li>
                    {i18n.language === "vi"
                      ? "Điều chỉnh thời gian học"
                      : "Adjust study times"}
                  </li>
                  <li>
                    {i18n.language === "vi"
                      ? "Lưu vào lịch học của bạn"
                      : "Save to your calendar"}
                  </li>
                </ul>
              </div>

              <div className="ag-success-actions">
                <button
                  className="ag-success-btn ag-success-primary"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/schedule-editor");
                  }}
                >
                  <i className="fas fa-edit"></i>
                  {i18n.language === "vi" ? "Xem & Chỉnh sửa" : "Review & Edit"}
                </button>
              </div>
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
              <p className="ag-error-subtitle">
                Không thể tạo lịch học lúc này
              </p>
            </div>

            <div className="ag-error-body">
              <div className="ag-error-message">
                <p>{errorMessage || "Có lỗi xảy ra trong quá trình tạo lịch học."}</p>
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="upgrade-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upgrade-modal-header">
              <h3>🚀 Hết lượt tạo lịch miễn phí!</h3>
              <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
            </div>
            <div className="upgrade-modal-content">
              <p>Bạn đã sử dụng hết 4 lượt tạo lịch học miễn phí hôm nay.</p>
              <div className="premium-features">
                <h4>✨ Ưu đãi Premium:</h4>
                <ul>
                  <li>✓ Không giới hạn tạo lịch học</li>
                  <li>✓ Không giới hạn câu hỏi AI</li>
                  <li>✓ Phân tích chi tiết hơn</li>
                  <li>✓ Ưu tiên hỗ trợ</li>
                </ul>
              </div>
              <div className="upgrade-modal-actions">
                <button className="upgrade-now-btn" onClick={() => navigate('/pricing')}>
                  Đăng ký Premium
                </button>
                <button className="maybe-later-btn" onClick={() => setShowUpgradeModal(false)}>
                  Để sau
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
