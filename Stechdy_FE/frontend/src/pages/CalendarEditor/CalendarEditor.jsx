import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SidebarNav from "../../components/common/SidebarNav";
import BottomNav from "../../components/common/BottomNav";
import config from "../../config";
import "./CalendarEditor.css";
import veryHappyImg from "../../assets/Veryhappy.png";

const CalendarEditor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningDays, setWarningDays] = useState([]);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch schedule from database on mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchScheduleFromDatabase();
      await fetchSubjects();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScheduleFromDatabase = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all sessions from current week onwards
      const today = new Date();
      const response = await fetch(
        `${config.apiUrl}/study-sessions?from=${today.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const sessions = await response.json();
        
        // Convert sessions to events format
        const eventsList = sessions.map((session, index) => {
          const sessionDate = new Date(session.date);
          const dateStr = sessionDate.toISOString().split("T")[0];
          
          const startHour = parseInt(session.startTime?.split(":")[0] || "8");
          let timeSlot = "morning";
          if (startHour >= 13 && startHour < 17) timeSlot = "afternoon";
          else if (startHour >= 17) timeSlot = "evening";

          return {
            id: session._id,
            date: dateStr,
            dayOfWeek: getDayName(dateStr),
            slot: 1, // Will be recalculated
            startTime: session.startTime || "08:00",
            endTime: session.endTime || "09:30",
            subjectCode: session.subjectInfo?.subjectName || session.subjectId?.subjectName || "Study",
            subjectId: session.subjectId?._id || session.subjectId,
            sessionNo: index + 1,
            status: session.status || "scheduled",
            timeSlot: timeSlot,
            originalSessionId: session._id
          };
        });

        // Recalculate slots per day
        const eventsByDate = {};
        eventsList.forEach(event => {
          if (!eventsByDate[event.date]) {
            eventsByDate[event.date] = [];
          }
          eventsByDate[event.date].push(event);
        });

        // Assign slot numbers
        Object.keys(eventsByDate).forEach(date => {
          eventsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
          eventsByDate[date].forEach((event, idx) => {
            event.slot = idx + 1;
          });
        });

        const finalEvents = Object.values(eventsByDate).flat();
        setEvents(finalEvents);
        // Successfully loaded sessions silently
      } else {
        console.error("Failed to load schedule");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      // Error handled silently
    } finally {
      setIsLoading(false);
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
      console.error("Error fetching subjects:", error);
    }
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  };

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    today.setDate(diff + weekOffset * 7);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      weekDates.push({
        date: dateStr,
        dayName: getDayName(dateStr),
        dayNumber: date.getDate(),
      });
    }
    return weekDates;
  };

  const getEventsForDateAndSlot = (date, slot) => {
    return events.filter((e) => e.date === date && e.slot === slot);
  };

  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetDate, targetSlot) => {
    e.preventDefault();
    
    if (!draggedEvent) return;

    // Check if slot is already occupied
    const existingEvent = events.find(
      (ev) => ev.date === targetDate && ev.slot === targetSlot
    );

    if (existingEvent && existingEvent.id !== draggedEvent.id) {
      // Slot occupied - cancel move
      setDraggedEvent(null);
      return;
    }

    // Determine time slot and auto-adjust start/end time
    let newStartTime, newEndTime, newTimeSlot;
    
    if (targetSlot === 1) {
      // Morning slot: 08:00-12:00
      newStartTime = "08:00";
      newEndTime = "09:30";
      newTimeSlot = "morning";
    } else if (targetSlot === 2) {
      // Afternoon slot: 13:00-17:00
      newStartTime = "13:00";
      newEndTime = "14:30";
      newTimeSlot = "afternoon";
    } else {
      // Evening slot: 18:00-22:00
      newStartTime = "18:00";
      newEndTime = "19:30";
      newTimeSlot = "evening";
    }

    // Move event with updated time
    const updatedEvents = events.map((ev) => {
      if (ev.id === draggedEvent.id) {
        return {
          ...ev,
          date: targetDate,
          dayOfWeek: getDayName(targetDate),
          slot: targetSlot,
          startTime: newStartTime,
          endTime: newEndTime,
          timeSlot: newTimeSlot,
        };
      }
      return ev;
    });

    setEvents(updatedEvents);
    setHasChanges(true);
    setDraggedEvent(null);
    // Session moved successfully
  };

  const handleEditEvent = (event) => {
    setEditingEvent({ ...event });
    setShowEditModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Delete this session?")) {
      const updatedEvents = events.filter((e) => e.id !== eventId);
      setEvents(updatedEvents);
      setHasChanges(true);
      // Session deleted successfully
    }
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;

    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id ? editingEvent : e
    );
    setEvents(updatedEvents);
    setHasChanges(true);
    setShowEditModal(false);
    // Session updated successfully
  };

  const saveToDatabase = async (skipWarning = false) => {
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
      
      // Group events by originalSessionId for updates
      const sessionsToUpdate = events.filter(e => e.originalSessionId).map(event => ({
        sessionId: event.originalSessionId,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status || "scheduled",
        subjectId: event.subjectId
      }));

      // Send bulk update request
      const response = await fetch(
        `${config.apiUrl}/study-sessions/bulk-update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ sessions: sessionsToUpdate })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setShowSuccessModal(true);
        setHasChanges(false);
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const checkSessionsPerDay = () => {
    const sessionsByDate = {};
    events.forEach((event) => {
      if (!sessionsByDate[event.date]) {
        sessionsByDate[event.date] = 0;
      }
      sessionsByDate[event.date]++;
    });

    const daysOver3 = Object.entries(sessionsByDate)
      .filter(([date, count]) => count > 3)
      .map(([date, count]) => ({ date, count }));

    return daysOver3;
  };

  const calculateStats = () => {
    const stats = {};
    let totalSessions = 0;
    let totalHours = 0;
    
    events.forEach(event => {
      const subject = event.subjectCode;
      if (!stats[subject]) {
        stats[subject] = {
          totalSessions: 0,
          totalHours: 0
        };
      }
      
      stats[subject].totalSessions += 1;
      totalSessions += 1;
      
      // Calculate duration
      const [startH, startM] = event.startTime.split(':').map(Number);
      const [endH, endM] = event.endTime.split(':').map(Number);
      const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      const durationHours = durationMinutes / 60;
      
      stats[subject].totalHours += durationHours;
      totalHours += durationHours;
    });

    return { stats, totalSessions, totalHours };
  };

  const handleWarningConfirm = () => {
    setShowWarningModal(false);
    saveToDatabase(true);
  };

  const weekDates = getWeekDates();

  return (
    <div className="calendar-editor-container">
      <SidebarNav />
      
      <div className="calendar-editor-wrapper">
        {/* Header */}
        <header className="calendar-editor-header">
          <button className="ce-back-button" onClick={() => navigate("/calendar")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="ce-page-title">
            Edit Calendar
            {hasChanges && <span className="ce-unsaved-badge">●</span>}
          </h1>
          <button
            className={`ce-save-button ${hasChanges ? 'has-changes' : ''}`}
            onClick={() => saveToDatabase()}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <span className="spinner-small"></span>
                <span>Saving...</span>
              </>
            ) : hasChanges ? (
              <>
              <span>Save Changes</span>
              </>
            ) : (
              <span>No Changes</span>
            )}
          </button>
        </header>

        {isLoading ? (
          <div className="ce-loading-container">
            <div className="ce-spinner"></div>
            <p>{t("calendarEditor.loading") || "Loading your schedule..."}</p>
          </div>
        ) : (
          <>
            {/* Week Navigation */}
            <div className="ce-week-navigation">
              <button className="ce-week-nav-btn" onClick={() => setWeekOffset(weekOffset - 1)}>‹</button>
              <span className="ce-week-display">
                {weekOffset === 0 
                  ? "This Week" 
                  : `Week ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`
                }
              </span>
              <button className="ce-week-nav-btn" onClick={() => setWeekOffset(weekOffset + 1)}>›</button>
            </div>

            {/* Schedule Grid */}
            <div className="ce-schedule-grid-container">
              <div className="ce-schedule-grid">
                {/* Time Labels Column */}
                <div className="ce-time-labels">
                  <div className="ce-time-label">
                    <span className="ce-slot-icon">🌅</span>
                    <span className="ce-slot-text">Morning</span>
                    <span className="ce-slot-time">08:00-12:00</span>
                  </div>
                  <div className="ce-time-label">
                    <span className="ce-slot-icon">☀️</span>
                    <span className="ce-slot-text">Afternoon</span>
                    <span className="ce-slot-time">13:00-17:00</span>
                  </div>
                  <div className="ce-time-label">
                    <span className="ce-slot-icon">🌙</span>
                    <span className="ce-slot-text">Evening</span>
                    <span className="ce-slot-time">18:00-22:00</span>
                  </div>
                </div>

                {/* Day Columns */}
                {weekDates.map((dayInfo) => (
                  <div key={dayInfo.date} className="ce-day-column">
                    <div className="ce-day-header">
                      <div className="ce-day-name">{dayInfo.dayName}</div>
                      <div className="ce-day-number">{dayInfo.dayNumber}</div>
                    </div>

                    {[1, 2, 3].map((slot) => {
                      const eventsInSlot = getEventsForDateAndSlot(dayInfo.date, slot);

                      return (
                        <div
                          key={`${dayInfo.date}-${slot}`}
                          className={`ce-time-slot ${eventsInSlot.length > 0 ? "occupied" : "empty"}`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, dayInfo.date, slot)}
                        >
                          {eventsInSlot.map((event) => (
                            <div
                              key={event.id}
                              className="ce-event-card"
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                            >
                              <div className="ce-event-subject">{event.subjectCode}</div>
                              <div className="ce-event-time">
                                {event.startTime} - {event.endTime}
                              </div>
                              <div className="ce-event-actions">
                                <button onClick={() => handleEditEvent(event)} title="Edit">✏️</button>
                                <button onClick={() => handleDeleteEvent(event.id)} title="Delete">🗑️</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Section */}
            {events.length > 0 && (
              <div className="ce-stats-container">
                <h3 className="ce-stats-title">📊 Learning Statistics</h3>
                <div className="ce-stats-overview">
                  <div className="ce-stat-item-overview">
                    <div className="ce-stat-icon">📚</div>
                    <div className="ce-stat-text">
                      <div className="ce-stat-label">Total Sessions</div>
                      <div className="ce-stat-value">{calculateStats().totalSessions}</div>
                    </div>
                  </div>
                  <div className="ce-stat-item-overview">
                    <div className="ce-stat-icon">⏱️</div>
                    <div className="ce-stat-text">
                      <div className="ce-stat-label">Total Hours</div>
                      <div className="ce-stat-value">{calculateStats().totalHours.toFixed(1)}h</div>
                    </div>
                  </div>
                </div>
                
                {Object.entries(calculateStats().stats).length > 0 && (
                  <div className="ce-stats-by-subject">
                    <h4 className="ce-stats-subtitle">Hours by Subject</h4>
                    <div className="ce-stats-grid">
                      {Object.entries(calculateStats().stats).map(([subject, stats]) => (
                        <div key={subject} className="ce-stat-card">
                          <div className="ce-stat-card-subject">{subject}</div>
                          <div className="ce-stat-card-details">
                            <span className="ce-stat-card-item">{stats.totalHours.toFixed(1)}h</span>
                            <span className="ce-stat-card-item">{stats.totalSessions} session{stats.totalSessions > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />

      {/* Edit Modal */}
      {showEditModal && editingEvent && (
        <div className="ce-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="ce-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Session</h2>
            <div className="ce-form-group">
              <label>Subject:</label>
              <select
                value={editingEvent.subjectCode}
                onChange={(e) => setEditingEvent({ ...editingEvent, subjectCode: e.target.value })}
              >
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject.subjectName}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="ce-form-group">
              <label>Start Time:</label>
              <input
                type="time"
                value={editingEvent.startTime}
                onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
              />
            </div>
            <div className="ce-form-group">
              <label>End Time:</label>
              <input
                type="time"
                value={editingEvent.endTime}
                onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
              />
            </div>
            <div className="ce-modal-actions">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleSaveEdit} className="ce-btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="ce-modal-overlay">
          <div className="ce-modal-content ce-warning-modal">
            <h2>⚠️ Warning</h2>
            <p>Some days have more than 3 sessions:</p>
            <ul>
              {warningDays.map((day) => (
                <li key={day.date}>
                  {day.date}: {day.count} sessions
                </li>
              ))}
            </ul>
            <p>Continue saving anyway?</p>
            <div className="ce-modal-actions">
              <button onClick={() => setShowWarningModal(false)}>Cancel</button>
              <button onClick={handleWarningConfirm} className="ce-btn-primary">Yes, Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="ce-modal-overlay">
          <div className="ce-modal-content ce-success-modal">
            <div className="ce-success-icon">
              <img src={veryHappyImg} alt="Success" />
            </div>
            <h2>Schedule Updated Successfully!</h2>
            <p>Your calendar has been saved with all changes.</p>
            <div className="ce-modal-actions">
              <button 
                className="ce-btn-primary" 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/calendar");
                }}
              >
                Back to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarEditor;
