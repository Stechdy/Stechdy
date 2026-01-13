import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import NotificationBell from "../../components/notification/NotificationBell";
import { getVietnamTime, getVietnamDate } from "../../utils/helpers";
import config from "../../config";
import "./Calendar.css";

const Calendar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(getVietnamDate());
  const [weekOffset, setWeekOffset] = useState(0);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessionsForDate(selectedDate);
  }, [selectedDate]);

  const fetchSessionsForDate = async (date) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

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
        // Map subjectId to subjectInfo for consistency
        const mappedData = data.map((session) => ({
          ...session,
          subjectInfo: session.subjectId || null,
        }));
        setSessions(mappedData);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return { text: t("calendar.completed"), color: "#10B981" };
      case "missed":
        return { text: t("calendar.missed"), color: "#EF4444" };
      case "scheduled":
        return { text: t("calendar.scheduled"), color: "#8AC0D5" };
      default:
        return { text: "Unknown", color: "#9CA3AF" };
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

  const getWeekDays = () => {
    const start = getVietnamDate();
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start.setDate(diff + weekOffset * 7);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const weekDays = getWeekDays();
  const dayNames =
    i18n.language === "vi"
      ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthNames =
    i18n.language === "vi"
      ? [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12",
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

  return (
    <div className="calendar-page-container">
      <SidebarNav />
      <div className="calendar-page">
        <header className="calendar-header">
          <div className="header-spacer"></div>
          <h1 className="calendar-page-title">{t("calendar.title")}</h1>
          <NotificationBell />
        </header>

        <main className="calendar-main">
          {/* Week Calendar */}
          <div className="week-calendar-container">
            <div className="week-header">
              <div className="month-year">
                {monthNames[weekDays[0].getMonth()]} {weekDays[0].getFullYear()}
              </div>
              <div className="week-navigation">
                <button onClick={() => setWeekOffset(weekOffset - 1)}>‹</button>
                <span>
                  {t("calendar.week")} {getWeekNumber(weekDays[0])}
                </span>
                <button onClick={() => setWeekOffset(weekOffset + 1)}>›</button>
              </div>
            </div>
            <div className="week-calendar">
              {weekDays.map((date, idx) => {
                const isToday =
                  date.toDateString() === getVietnamDate().toDateString();
                const isSelected =
                  date.toDateString() === selectedDate.toDateString();
                return (
                  <div
                    key={idx}
                    className={`week-day ${isToday ? "today" : ""} ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="day-name">{dayNames[idx]}</span>
                    <span className="day-number">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Sessions */}
          <div className="sessions-section">
            <h2 className="section-title">
              {selectedDate.toDateString() === getVietnamDate().toDateString()
                ? `${t("calendar.today")}, ${selectedDate.toLocaleDateString(
                    i18n.language === "vi" ? "vi-VN" : "en-US",
                    { month: "short", day: "numeric" }
                  )}`
                : selectedDate.toLocaleDateString(
                    i18n.language === "vi" ? "vi-VN" : "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
            </h2>
            <p className="sessions-count">
              {sessions.length}{" "}
              {sessions.length !== 1
                ? t("calendar.studySessions")
                : t("calendar.studySession")}
            </p>

            <div className="sessions-list">
              {sessions.length === 0 ? (
                <div className="no-sessions">
                  <p>{t("calendar.noSessions")}</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const statusBadge = getStatusBadge(session.status);

                  return (
                    <div
                      key={session._id}
                      className="calendar-session-item"
                      onClick={() => navigate(`/slot-detail/${session._id}`)}
                    >
                      <div
                        className="calendar-session-icon"
                        style={{
                          background: session.subjectInfo?.color || "#8AC0D5",
                        }}
                      >
                        {getTimeSlotIcon(session.timeSlot)}
                      </div>
                      <div className="calendar-session-details">
                        <div className="calendar-session-time">
                          {session.startTime} - {session.endTime}
                        </div>
                        <div className="calendar-session-subject">
                          📚{" "}
                          {session.subjectInfo?.subjectName ||
                            t("calendar.noSubject")}
                        </div>
                      </div>
                      <span
                        className="calendar-status-badge"
                        style={{ color: statusBadge.color }}
                      >
                        {statusBadge.text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Calendar;
