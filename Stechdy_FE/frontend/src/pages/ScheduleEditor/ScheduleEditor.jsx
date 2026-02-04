import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SidebarNav from "../../components/common/SidebarNav";
import BottomNav from "../../components/common/BottomNav";
import config from "../../config";
import "./ScheduleEditor.css";
import veryHappyImg from "../../assets/Veryhappy.png";

const ScheduleEditor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [events, setEvents] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [subjectColors, setSubjectColors] = useState({});
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [isNewEvent, setIsNewEvent] = useState(false); // Track if modal is for new event
  const [modalError, setModalError] = useState(""); // Error message in modal
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningDays, setWarningDays] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const COLOR_PALETTE = [
    "#5bbec8", "#f472b6", "#fbbf24", "#34d399",
    "#a78bfa", "#fb923c", "#60a5fa", "#f87171"
  ];

  const TIME_SLOTS = [
    { id: "morning", label: t("scheduleEditor.timeSlots.morning") || "Morning", startTime: "08:00", endTime: "12:00", icon: "🌅" },
    { id: "afternoon", label: t("scheduleEditor.timeSlots.afternoon") || "Afternoon", startTime: "13:00", endTime: "17:00", icon: "☀️" },
    { id: "evening", label: t("scheduleEditor.timeSlots.evening") || "Evening", startTime: "18:00", endTime: "22:00", icon: "🌙" }
  ];

  const DAYS = [
    t("scheduleEditor.days.mon") || "Mon",
    t("scheduleEditor.days.tue") || "Tue",
    t("scheduleEditor.days.wed") || "Wed",
    t("scheduleEditor.days.thu") || "Thu",
    t("scheduleEditor.days.fri") || "Fri",
    t("scheduleEditor.days.sat") || "Sat",
    t("scheduleEditor.days.sun") || "Sun"
  ];

  // Extract schedule data from various formats
  const extractScheduleData = (data) => {
    if (data.schedule && Array.isArray(data.schedule)) {
      if (data.schedule.length > 0 && data.schedule[0]?.date && data.schedule[0]?.sessions) {
        return data;
      }
      if (data.schedule[0]?.data?.schedule) {
        return { schedule: data.schedule[0].data.schedule };
      }
      if (data.schedule[0]?.day_of_week && data.schedule[0]?.sessions) {
        return data;
      }
    }
    if (data.data?.schedule && Array.isArray(data.data.schedule)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      if (data[0]?.data?.schedule) {
        return { schedule: data[0].data.schedule };
      }
      if (data[0]?.date && data[0]?.sessions) {
        return { schedule: data };
      }
    }
    return null;
  };

  // Normalize schedule to events array
  const normalizeToEvents = (schedule) => {
    const eventsList = [];
    let globalId = 0;

    schedule.forEach((day) => {
      const date = day.date;
      let slotCounter = 0;

      (day.sessions || []).forEach((session) => {
        slotCounter++;
        globalId++;

        const startHour = parseInt(session.start_time?.split(":")[0] || "8");
        let timeSlot = "morning";
        if (startHour >= 13 && startHour < 17) timeSlot = "afternoon";
        else if (startHour >= 17) timeSlot = "evening";

        eventsList.push({
          id: `event-${globalId}`,
          date: date,
          dayOfWeek: day.day_of_week || getDayName(date),
          slot: slotCounter,
          startTime: session.start_time || "08:00",
          endTime: session.end_time || "09:30",
          subjectCode: session.subject || session.subject_code || "Study",
          sessionNo: session.session_no || session.sessionNo || slotCounter,
          status: session.status || "scheduled",
          timeSlot: timeSlot
        });
      });
    });

    return eventsList;
  };

  const getDayName = (dateStr) => {
    const parts = String(dateStr).split("-").map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 12, 0, 0);
    const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return DAYS_FULL[date.getDay()];
  };

  const assignSubjectColors = useCallback((eventsList) => {
    const subjects = new Set();
    eventsList.forEach((e) => subjects.add(e.subjectCode));

    const colors = {};
    let colorIndex = 0;
    subjects.forEach((subject) => {
      colors[subject] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
      colorIndex++;
    });
    setSubjectColors(colors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatDateISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Load data on mount
  useEffect(() => {
    const today = new Date();
    setCurrentWeekStart(getWeekStart(today));

    const stored = localStorage.getItem("studySchedule");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const scheduleData = extractScheduleData(parsed);
        if (scheduleData?.schedule?.length > 0) {
          const normalizedEvents = normalizeToEvents(scheduleData.schedule);
          setEvents(normalizedEvents);
          assignSubjectColors(normalizedEvents);
        }
      } catch (error) {
        console.error("Error parsing schedule:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignSubjectColors]);

  // Get date for a specific day index in current week
  const getDateForDay = (dayIndex) => {
    if (!currentWeekStart) return "";
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    return formatDateISO(date);
  };

  // Get events for a specific cell
  const getEventsForCell = (dayIndex, timeSlotId) => {
    const dateStr = getDateForDay(dayIndex);
    const filteredEvents = events.filter((e) => {
      const startHour = parseInt(e.startTime?.split(":")[0] || "8");
      let eventSlot = "morning";
      if (startHour >= 13 && startHour < 17) eventSlot = "afternoon";
      else if (startHour >= 17) eventSlot = "evening";
      return e.date === dateStr && eventSlot === timeSlotId;
    });

    // Sort by start time (earliest first)
    return filteredEvents.sort((a, b) => {
      const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };
      return parseTime(a.startTime) - parseTime(b.startTime);
    });
  };

  // Drag handlers
  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    setDraggedEvent(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, dayIndex, timeSlot) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    if (!draggedEvent) return;

    const newDate = getDateForDay(dayIndex);
    const slot = TIME_SLOTS.find((s) => s.id === timeSlot);

    // Check for existing events in this slot (excluding the dragged one)
    const existingEvents = events.filter(
      (e) => e.id !== draggedEvent.id && e.date === newDate && e.timeSlot === timeSlot
    );

    // Calculate new times based on time slot
    let newStartTime = slot.startTime;
    let newEndTime = "";

    // If there are existing events, find the latest end time and add 30 minutes
    if (existingEvents.length > 0) {
      const latestEvent = existingEvents.reduce((latest, event) => {
        const [latestH, latestM] = latest.endTime.split(":").map(Number);
        const [eventH, eventM] = event.endTime.split(":").map(Number);
        const latestMinutes = latestH * 60 + latestM;
        const eventMinutes = eventH * 60 + eventM;
        return eventMinutes > latestMinutes ? event : latest;
      });

      // Start 30 minutes after the latest event ends
      const [latestEndH, latestEndM] = latestEvent.endTime.split(":").map(Number);
      const newStartMinutes = latestEndH * 60 + latestEndM + 30;
      const newStartH = Math.floor(newStartMinutes / 60);
      const newStartM = newStartMinutes % 60;
      newStartTime = `${String(newStartH).padStart(2, "0")}:${String(newStartM).padStart(2, "0")}`;
    }

    // Keep original duration
    const [oldStartH, oldStartM] = draggedEvent.startTime.split(":").map(Number);
    const [oldEndH, oldEndM] = draggedEvent.endTime.split(":").map(Number);
    const durationMinutes = (oldEndH * 60 + oldEndM) - (oldStartH * 60 + oldStartM);

    const [newStartH, newStartM] = newStartTime.split(":").map(Number);
    const newEndMinutes = newStartH * 60 + newStartM + durationMinutes;
    const newEndH = Math.floor(newEndMinutes / 60);
    const newEndMins = newEndMinutes % 60;
    newEndTime = `${String(newEndH).padStart(2, "0")}:${String(newEndMins).padStart(2, "0")}`;

    // Update event
    setEvents((prev) =>
      prev.map((event) =>
        event.id === draggedEvent.id
          ? {
            ...event,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            timeSlot: timeSlot,
            dayOfWeek: getDayName(newDate)
          }
          : event
      )
    );

    setHasChanges(true);
    setDraggedEvent(null);
  };

  // Edit modal handlers
  const openEditModal = (event) => {
    setEditingEvent({ ...event });
    setShowEditModal(true);
    setModalError(""); // Clear any previous errors
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    setShowEditModal(false);
    setIsNewEvent(false); // Reset new event flag
    setModalError(""); // Clear error when closing
  };

  const saveEventChanges = () => {
    if (!editingEvent) return;

    // Clear previous error
    setModalError("");

    // Check for time conflicts
    const hasConflict = events.some((event) => {
      // Skip checking against itself when editing
      if (event.id === editingEvent.id) return false;

      // Check if same date
      if (event.date !== editingEvent.date) return false;

      // Parse times to minutes for easier comparison
      const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const eventStart = parseTime(event.startTime);
      const eventEnd = parseTime(event.endTime);
      const editingStart = parseTime(editingEvent.startTime);
      const editingEnd = parseTime(editingEvent.endTime);

      // Check for overlap
      return (
        (editingStart >= eventStart && editingStart < eventEnd) ||
        (editingEnd > eventStart && editingEnd <= eventEnd) ||
        (editingStart <= eventStart && editingEnd >= eventEnd)
      );
    });

    if (hasConflict) {
      setModalError(t("scheduleEditor.messages.timeConflict"));
      return;
    }

    // Validate time range
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    if (parseTime(editingEvent.startTime) >= parseTime(editingEvent.endTime)) {
      setModalError(t("scheduleEditor.messages.invalidTimeRange"));
      return;
    }

    if (isNewEvent) {
      // Add new event to the list
      setEvents((prev) => [...prev, editingEvent]);
      assignSubjectColors([...events, editingEvent]);
      displayToast(t("scheduleEditor.messages.sessionAdded"), "success");
    } else {
      // Update existing event
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id ? editingEvent : event
        )
      );
      displayToast(t("scheduleEditor.messages.sessionUpdated"), "success");
    }

    setHasChanges(true);
    closeEditModal();
  };

  const deleteEvent = (eventId) => {
    if (window.confirm(t("scheduleEditor.messages.deleteConfirm"))) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setHasChanges(true);
      closeEditModal();
      displayToast(t("scheduleEditor.messages.sessionDeleted"), "info");
    }
  };

  // Add new slot handler - only creates pending event, actual add happens on Save
  const handleAddSlot = (dayIndex, timeSlotId) => {
    const dateStr = getDateForDay(dayIndex);
    const slot = TIME_SLOTS.find((s) => s.id === timeSlotId);

    // Get subjects from existing events
    const existingSubjects = [...new Set(events.map(e => e.subjectCode))];
    const defaultSubject = existingSubjects.length > 0 ? existingSubjects[0] : "New Subject";

    // Generate unique ID
    const newId = `event-${Date.now()}`;

    // Calculate default times based on time slot
    let startTime = slot.startTime;
    let endTime = "";

    // Default duration: 1.5 hours
    const [startH, startM] = startTime.split(":").map(Number);
    const endMinutes = startH * 60 + startM + 90;
    const endH = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    endTime = `${String(endH).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

    const newEvent = {
      id: newId,
      date: dateStr,
      dayOfWeek: getDayName(dateStr),
      slot: events.filter(e => e.date === dateStr).length + 1,
      startTime: startTime,
      endTime: endTime,
      subjectCode: defaultSubject,
      sessionNo: events.filter(e => e.subjectCode === defaultSubject).length + 1,
      status: "scheduled",
      timeSlot: timeSlotId
    };

    // Don't add to events yet - only open modal
    // Event will be added when user clicks Save
    setIsNewEvent(true);
    setEditingEvent(newEvent);
    setShowEditModal(true);
    setModalError(""); // Clear any previous errors
  };

  // Apply first week pattern to all weeks
  const applyToAllWeeks = () => {
    setIsApplying(true);

    try {
      // Get all weeks in the schedule
      const allWeeks = {};
      events.forEach(event => {
        const weekStart = formatDateISO(getWeekStart(new Date(event.date)));
        if (!allWeeks[weekStart]) {
          allWeeks[weekStart] = [];
        }
        allWeeks[weekStart].push(event);
      });

      const weekKeys = Object.keys(allWeeks).sort();
      if (weekKeys.length <= 1) {
        displayToast("Chỉ có 1 tuần trong lịch học", "info");
        setIsApplying(false);
        return;
      }

      const firstWeekKey = weekKeys[0];
      const firstWeekEvents = allWeeks[firstWeekKey];

      // Create a pattern from first week (day of week -> sessions)
      const weekPattern = {};
      firstWeekEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const dayOfWeek = eventDate.getDay(); // 0=Sunday, 1=Monday, etc.

        if (!weekPattern[dayOfWeek]) {
          weekPattern[dayOfWeek] = [];
        }

        weekPattern[dayOfWeek].push({
          startTime: event.startTime,
          endTime: event.endTime,
          subjectCode: event.subjectCode,
          status: event.status,
          timeSlot: event.timeSlot
        });
      });

      // Apply pattern to all other weeks
      let newEvents = [...firstWeekEvents]; // Keep first week as is
      let globalId = events.length;

      for (let i = 1; i < weekKeys.length; i++) {
        const weekKey = weekKeys[i];
        const weekStartDate = new Date(weekKey);

        // For each day of week in the pattern
        Object.keys(weekPattern).forEach(dayOfWeek => {
          const dayNum = parseInt(dayOfWeek);
          const sessions = weekPattern[dayOfWeek];

          // Calculate the actual date for this day in this week
          const targetDate = new Date(weekStartDate);
          const currentDay = targetDate.getDay();
          const diff = dayNum - currentDay;
          targetDate.setDate(targetDate.getDate() + diff);
          const dateStr = formatDateISO(targetDate);
          const dayName = getDayName(dateStr);

          // Create sessions for this day
          sessions.forEach((session, idx) => {
            globalId++;
            newEvents.push({
              id: `event-${globalId}`,
              date: dateStr,
              dayOfWeek: dayName,
              slot: idx + 1,
              startTime: session.startTime,
              endTime: session.endTime,
              subjectCode: session.subjectCode,
              sessionNo: idx + 1,
              status: session.status,
              timeSlot: session.timeSlot
            });
          });
        });
      }

      // Update state
      setEvents(newEvents);
      setHasChanges(true);

      // Update localStorage
      const scheduleByDate = {};
      newEvents.forEach((event) => {
        if (!scheduleByDate[event.date]) {
          scheduleByDate[event.date] = {
            date: event.date,
            day_of_week: event.dayOfWeek,
            sessions: []
          };
        }
        scheduleByDate[event.date].sessions.push({
          subject: event.subjectCode,
          start_time: event.startTime,
          end_time: event.endTime,
          session_no: event.sessionNo,
          status: event.status
        });
      });

      const schedule = Object.values(scheduleByDate).sort((a, b) => a.date.localeCompare(b.date));
      localStorage.setItem("studySchedule", JSON.stringify({ schedule }));

      displayToast(`Đã áp dụng mẫu tuần đầu cho ${weekKeys.length - 1} tuần còn lại!`, "success");
    } catch (error) {
      console.error("Error applying to all weeks:", error);
      displayToast("Lỗi khi áp dụng cho tất cả tuần", "error");
    } finally {
      setIsApplying(false);
    }
  };

  // Check for days with more than 3 sessions
  const checkSessionsPerDay = () => {
    const sessionsByDate = {};
    events.forEach((event) => {
      if (!sessionsByDate[event.date]) {
        sessionsByDate[event.date] = [];
      }
      sessionsByDate[event.date].push(event);
    });

    const daysOver3 = Object.entries(sessionsByDate)
      .filter(([date, sessions]) => sessions.length > 3)
      .map(([date, sessions]) => ({
        date,
        count: sessions.length,
        formattedDate: new Date(date).toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "numeric",
          month: "numeric"
        })
      }));

    return daysOver3;
  };

  // Save to database
  const saveToDatabase = async (skipWarning = false) => {
    // Check if there are days with more than 3 sessions
    if (!skipWarning) {
      const daysOver3 = checkSessionsPerDay();
      if (daysOver3.length > 0) {
        setWarningDays(daysOver3);
        setShowWarningModal(true);
        return;
      }
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const inputData = JSON.parse(localStorage.getItem("studyScheduleInput") || "{}");

      // Convert events back to schedule format
      const scheduleByDate = {};
      events.forEach((event) => {
        if (!scheduleByDate[event.date]) {
          scheduleByDate[event.date] = {
            date: event.date,
            day_of_week: event.dayOfWeek,
            sessions: []
          };
        }
        scheduleByDate[event.date].sessions.push({
          subject: event.subjectCode,
          start_time: event.startTime,
          end_time: event.endTime,
          session_no: event.sessionNo,
          status: event.status
        });
      });

      const schedule = Object.values(scheduleByDate).sort((a, b) => a.date.localeCompare(b.date));

      // Save to localStorage
      localStorage.setItem("studySchedule", JSON.stringify({ schedule }));

      // Save to backend
      if (token) {
        const response = await fetch(
          `${config.apiUrl}/ai-schedule/save`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              schedule,
              input: inputData,
              generated_at: new Date().toISOString(),
              message: "Schedule edited and saved"
            })
          }
        );

        const result = await response.json();

        if (result.success) {
          setHasChanges(false);
          setShowSuccessModal(true);

          // Clear localStorage after successful save
          localStorage.removeItem("studySchedule");
          localStorage.removeItem("studyScheduleInput");

          setTimeout(() => {
            navigate("/calendar");
          }, 2000);
        } else {
          throw new Error(result.message);
        }
      } else {
        displayToast("Schedule saved locally! Login to sync to cloud.", "warning");
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      displayToast("Failed to save schedule: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const displayToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleWarningConfirm = () => {
    setShowWarningModal(false);
    saveToDatabase(true); // Skip warning check and proceed
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
    displayToast("Vui lòng chỉnh sửa lại lịch học để không quá 3 buổi/ngày", "warning");
  };

  // Calculate statistics for each subject
  const calculateStats = () => {
    const stats = {};

    events.forEach(event => {
      const subject = event.subjectCode;
      if (!stats[subject]) {
        stats[subject] = {
          totalSessions: 0,
          totalHours: 0
        };
      }

      stats[subject].totalSessions += 1;

      // Calculate duration
      const [startH, startM] = event.startTime.split(':').map(Number);
      const [endH, endM] = event.endTime.split(':').map(Number);
      const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      const durationHours = durationMinutes / 60;

      stats[subject].totalHours += durationHours;
    });

    return stats;
  };

  // Week navigation
  const changeWeek = (delta) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + delta * 7);
    setCurrentWeekStart(newDate);
  };

  const formatWeekRange = () => {
    if (!currentWeekStart) return "";
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const formatDate = (d) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    return `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;
  };

  // Render grid
  const renderScheduleGrid = () => {
    if (!currentWeekStart) return null;

    return (
      <div className="schedule-grid">
        {/* Header row */}
        <div className="grid-header">
          <div className="time-column-header">{t("scheduleEditor.grid.time")}</div>
          {DAYS.map((day, idx) => {
            const date = new Date(currentWeekStart);
            date.setDate(date.getDate() + idx);
            const isToday = formatDateISO(new Date()) === formatDateISO(date);

            return (
              <div key={day} className={`day-column-header ${isToday ? "today" : ""}`}>
                <span className="day-name">{day}</span>
                <span className="day-date">{date.getDate()}</span>
              </div>
            );
          })}
        </div>

        {/* Time slot rows */}
        {TIME_SLOTS.map((slot) => (
          <div key={slot.id} className="grid-row">
            <div className="time-column">
              <span className="slot-icon">{slot.icon}</span>
              <span className="slot-name">{slot.label}</span>
              <span className="slot-time">{slot.startTime}-{slot.endTime}</span>
            </div>

            {DAYS.map((_, dayIdx) => {
              const cellEvents = getEventsForCell(dayIdx, slot.id);
              const isEmpty = cellEvents.length === 0;

              return (
                <div
                  key={`${slot.id}-${dayIdx}`}
                  className={`grid-cell ${isEmpty ? "empty" : ""}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dayIdx, slot.id)}
                >
                  {cellEvents.map((event) => {
                    const color = subjectColors[event.subjectCode] || COLOR_PALETTE[0];

                    return (
                      <div
                        key={event.id}
                        className="event-card"
                        style={{ backgroundColor: color }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openEditModal(event)}
                      >
                        <div className="event-subject">{event.subjectCode}</div>
                        <div className="event-time">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="event-drag-hint">
                          <i className="fas fa-grip-vertical"></i>
                        </div>
                      </div>
                    );
                  })}

                  {isEmpty && (
                    <div className="empty-slot">
                      <i className="fas fa-plus"></i>
                      <span>{t("scheduleEditor.grid.dropHere")}</span>
                    </div>
                  )}

                  {/* Add Slot Button */}
                  <button
                    className="se-btn-add-slot"
                    onClick={() => handleAddSlot(dayIdx, slot.id)}
                    title={t("scheduleEditor.grid.addSlot")}
                  >
                    <i className="fas fa-plus"></i>
                    <span>{t("scheduleEditor.grid.addSlot")}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Render edit modal
  const renderEditModal = () => {
    if (!showEditModal || !editingEvent) return null;

    return (
      <div className="se-modal-overlay" onClick={closeEditModal}>
        <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="se-modal-header">
            <h3>
              <i className={isNewEvent ? "fas fa-plus" : "fas fa-edit"}></i> {isNewEvent ? t("scheduleEditor.modal.addNewSession") : t("scheduleEditor.modal.editSession")}
            </h3>
            <button className="se-btn-close" onClick={closeEditModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="se-modal-body">
            {/* Error Message Display */}
            {modalError && (
              <div className="se-modal-error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{modalError}</span>
              </div>
            )}

            <div className="se-form-group">
              <label>{t("scheduleEditor.modal.subject")}</label>
              <select
                value={editingEvent.subjectCode}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, subjectCode: e.target.value })
                }
                className="subject-select"
              >
                {[...new Set(events.map(e => e.subjectCode))].map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="se-form-row">
              <div className="se-form-group">
                <label>{t("scheduleEditor.modal.startTime")}</label>
                <input
                  type="time"
                  value={editingEvent.startTime}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, startTime: e.target.value })
                  }
                />
              </div>
              <div className="se-form-group">
                <label>{t("scheduleEditor.modal.endTime")}</label>
                <input
                  type="time"
                  value={editingEvent.endTime}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="se-form-group">
              <label>{t("scheduleEditor.modal.date")}</label>
              <input
                type="date"
                value={editingEvent.date}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, date: e.target.value })
                }
              />
            </div>
          </div>

          {/* <div className="se-modal-footer">
            {!isNewEvent && (
              <button className="se-btn-delete" onClick={() => deleteEvent(editingEvent.id)}>
                <i className="fas fa-trash"></i> {t("scheduleEditor.modal.delete")}
              </button>
            )}
            <div className="se-btn-group">
              <button className="se-btn-cancel" onClick={closeEditModal}>
                {t("scheduleEditor.modal.cancel")}
              </button>
              <button className="se-btn-save" onClick={saveEventChanges}>
                <i className="fas fa-check"></i> {t("scheduleEditor.modal.save")}
              </button>
            </div>
          </div> */}
          <div className="se-modal-footer">
            <div className="se-modal-footer__buttons">
              {!isNewEvent && (
                <button className="se-btn-delete" onClick={() => deleteEvent(editingEvent.id)}>
                  <i className="fas fa-trash"></i> {t("scheduleEditor.modal.delete")}
                </button>
              )}
              <button className="se-btn-cancel" onClick={closeEditModal}>
                {t("scheduleEditor.modal.cancel")}
              </button>
              <button className="se-btn-save" onClick={saveEventChanges}>
                <i className="fas fa-check"></i> {t("scheduleEditor.modal.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="schedule-editor-container">
      <SidebarNav />

      <div className="schedule-editor-wrapper">
        {/* Header */}
        <header className="editor-header">
          <button className="editor-back-btn" onClick={() => navigate("/ai-generator")}>
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
          <h1 className="editor-page-title">
            {t("scheduleEditor.title")}
            {hasChanges && <span className="editor-unsaved-badge">●</span>}
          </h1>
          <button
            className="editor-save-btn"
            onClick={saveToDatabase}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>{t("scheduleEditor.saving")}</span>
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                <span>{t("scheduleEditor.save")}</span>
              </>
            )}
          </button>
        </header>

        {/* Week Navigation */}
        <div className="editor-week-nav-container">
          <button className="editor-week-nav-btn" onClick={() => changeWeek(-1)}>
            ‹
          </button>
          <div className="editor-week-info">
            <span className="week-range">{formatWeekRange()}</span>
          </div>
          <button className="editor-week-nav-btn" onClick={() => changeWeek(1)}>
            ›
          </button>
        </div>

        {/* Instructions */}
        <div className="editor-instructions">
          <div className="editor-instructions-left">
            <div className="instruction">
              <i className="fas fa-hand-pointer"></i>
              <span>{t("scheduleEditor.instructions.clickToEdit")}</span>
            </div>
            <div className="instruction">
              <i className="fas fa-arrows-alt"></i>
              <span>{t("scheduleEditor.instructions.dragAndDrop")}</span>
            </div>
            <div className="instruction">
              <i className="fas fa-save"></i>
              <span>{t("scheduleEditor.instructions.saveWhenDone")}</span>
            </div>
          </div>
          <button
            className="editor-save-all-weeks-btn"
            onClick={applyToAllWeeks}
            disabled={isApplying}
            title="Áp dụng mẫu tuần đầu cho tất cả tuần"
          >
            {isApplying ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang áp dụng...</span>
              </>
            ) : (
              <>
                <i className="fas fa-calendar-check"></i>
                <span>Apply to All Weeks</span>
              </>
            )}
          </button>
        </div>

        {/* Schedule Grid */}
        <main className="editor-content">
          {events.length === 0 ? (
            <div className="no-events-state">
              <i className="fas fa-calendar-times"></i>
              <h3>{t("scheduleEditor.noEvents.title")}</h3>
              <p>{t("scheduleEditor.noEvents.description")}</p>
              <button className="se-btn-generate-new" onClick={() => navigate("/ai-generator")}>
                <i className="fas fa-magic"></i>
                {t("scheduleEditor.noEvents.generateButton")}
              </button>
            </div>
          ) : (
            renderScheduleGrid()
          )}
        </main>

        {/* Legend - Below Grid, Centered */}
        {events.length > 0 && (
          <div className="editor-legend-container">
            <div className="editor-legend">
              <span className="editor-legend-title">{t("scheduleEditor.legend.title")}</span>
              {Object.entries(subjectColors).map(([subject, color]) => (
                <div key={subject} className="editor-legend-item">
                  <span className="editor-legend-color" style={{ backgroundColor: color }}></span>
                  <span className="editor-legend-label">{subject}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics - Below Legend */}
        {events.length > 0 && (
          <div className="editor-stats-container">
            <h3 className="editor-stats-title">{t("scheduleEditor.statistics.title")}</h3>
            <div className="editor-stats-grid">
              {Object.entries(calculateStats()).map(([subject, stats]) => (
                <div key={subject} className="editor-stat-card">
                  <div
                    className="editor-stat-indicator"
                    style={{ backgroundColor: subjectColors[subject] || '#8AC0D5' }}
                  ></div>
                  <div className="editor-stat-content">
                    <div className="editor-stat-subject">{subject}</div>
                    <div className="editor-stat-details">
                      <span className="editor-stat-item">
                        <i className="fas fa-clock"></i>
                        {stats.totalHours.toFixed(1)}{t("scheduleEditor.statistics.hours")}
                      </span>
                      <span className="editor-stat-item">
                        <i className="fas fa-book"></i>
                        {stats.totalSessions} {t("scheduleEditor.statistics.sessions")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {/* Edit Modal */}
      {renderEditModal()}

      {/* Warning Modal - More than 3 sessions per day */}
      {showWarningModal && (
        <div className="se-modal-overlay">
          <div className="se-modal-content" style={{ maxWidth: '500px' }}>
            <div className="se-modal-header">
              <h2 style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-exclamation-triangle"></i>
                Cảnh báo
              </h2>
            </div>
            <div className="se-modal-body">
              <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                <strong>Bạn không nên học quá 3 buổi trong 1 ngày!</strong>
              </p>
              <p style={{ marginBottom: '12px' }}>
                Các ngày có nhiều hơn 3 buổi học:
              </p>
              <ul style={{
                listStyle: 'none',
                padding: '0',
                margin: '0 0 16px 0',
                background: '#fef3c7',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {warningDays.map((day, index) => (
                  <li key={index} style={{
                    padding: '8px 0',
                    borderBottom: index < warningDays.length - 1 ? '1px solid #fcd34d' : 'none'
                  }}>
                    <strong>{day.formattedDate}</strong>: {day.count} buổi học
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Bạn có muốn tiếp tục lưu lịch học này không?
              </p>
            </div>
            <div className="se-modal-footer">
              <button
                className="se-btn-cancel"
                onClick={handleWarningCancel}
                style={{ flex: 1 }}
              >
                <i className="fas fa-times"></i> Hủy - Sửa lại
              </button>
              <button
                className="se-btn-save"
                onClick={handleWarningConfirm}
                style={{ flex: 1, background: '#f59e0b' }}
              >
                <i className="fas fa-check"></i> OK - Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="se-success-modal-overlay">
          <div className="se-success-modal-content">
            <div className="se-success-icon">
              <img src={veryHappyImg} alt="Very Happy" style={{ width: "80px", height: "80px" }} />
            </div>
            <h3>Lưu lịch học thành công!</h3>
            <p>Lịch học của bạn đã được lưu và đồng bộ thành công.</p>
            <button
              className="se-success-btn"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/calendar");
              }}
            >
              <i className="fas fa-calendar"></i> Về Lịch Học
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className={`se-toast se-toast-${toastType}`}>
          <i className={`fas ${toastType === "success" ? "fa-check-circle" :
            toastType === "error" ? "fa-exclamation-circle" :
              toastType === "warning" ? "fa-exclamation-triangle" :
                "fa-info-circle"
            }`}></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditor;
