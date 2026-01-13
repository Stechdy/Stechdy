import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import { getVietnamDate } from "../../utils/helpers";
import config from "../../config";
import "./SubjectDetail.css";

const SubjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [subject, setSubject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: "",
    dueDate: "",
    priorityLevel: "medium",
    deadlineType: "assignment",
  });

  useEffect(() => {
    fetchSubjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSubjectData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch subject info
      const subjectResponse = await fetch(
        `${config.apiUrl}/subjects/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (subjectResponse.ok) {
        const subjectData = await subjectResponse.json();
        setSubject(subjectData);
      }

      // Fetch sessions for this subject
      const sessionsResponse = await fetch(
        `${config.apiUrl}/study-sessions/subject/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      // Fetch deadlines for this subject
      const deadlinesResponse = await fetch(
        `${config.apiUrl}/deadlines/subject/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (deadlinesResponse.ok) {
        const deadlinesData = await deadlinesResponse.json();
        setDeadlines(deadlinesData);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching subject data:", error);
      setLoading(false);
    }
  };

  const handleAddDeadline = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("${config.apiUrl}/deadlines", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newDeadline,
          subjectId: id,
        }),
      });

      if (response.ok) {
        setShowAddDeadline(false);
        setNewDeadline({
          title: "",
          dueDate: "",
          priorityLevel: "medium",
          deadlineType: "assignment",
        });
        fetchSubjectData();
      }
    } catch (error) {
      console.error("Error adding deadline:", error);
    }
  };

  const calculateProgress = () => {
    if (sessions.length === 0) return { percent: 0, completed: 0, total: 0 };

    const completedMinutes = sessions
      .filter((s) => s.status === "completed")
      .reduce((total, session) => {
        const duration =
          session.actualDuration ||
          getDurationMinutes(session.startTime, session.endTime);
        return total + duration;
      }, 0);

    const totalMinutes = sessions.reduce((total, session) => {
      return total + getDurationMinutes(session.startTime, session.endTime);
    }, 0);

    const percent =
      totalMinutes > 0
        ? Math.round((completedMinutes / totalMinutes) * 100)
        : 0;

    return {
      percent,
      completed: Math.round((completedMinutes / 60) * 10) / 10, // Convert to hours with 1 decimal
      total: Math.round((totalMinutes / 60) * 10) / 10,
    };
  };

  const getDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 90;
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    return endH * 60 + endM - (startH * 60 + startM);
  };

  const getWeeklySessions = () => {
    const today = getVietnamDate();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return sessions
      .filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "missed":
        return "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return t("subjectDetail.status.completed");
      case "missed":
        return t("subjectDetail.status.missed");
      default:
        return t("subjectDetail.status.scheduled");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "#DC2626";
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      default:
        return "#10B981";
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = getVietnamDate();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return t("subjectDetail.due.overdue");
    if (diffDays === 0) return t("subjectDetail.due.today");
    if (diffDays === 1) return t("subjectDetail.due.tomorrow");
    if (diffDays < 7) return t("subjectDetail.due.inDays", { count: diffDays });
    if (diffDays < 14) return t("subjectDetail.due.inWeek");
    return t("subjectDetail.due.inWeeks", { count: Math.floor(diffDays / 7) });
  };

  const getDayName = (date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[new Date(date).getDay()];
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDuration = (startTime, endTime) => {
    const mins = getDurationMinutes(startTime, endTime);
    const hours = mins / 60;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="subject-detail-container">
        <SidebarNav />
        <div className="subject-detail-page">
          <div className="loading">{t("subjectDetail.loading")}</div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="subject-detail-container">
        <SidebarNav />
        <div className="subject-detail-page">
          <div className="loading">{t("subjectDetail.notFound")}</div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const weeklySessions = getWeeklySessions();
  const upcomingDeadlines = deadlines
    .filter((d) => !d.isCompleted && new Date(d.dueDate) >= getVietnamDate())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="subject-detail-container">
      <SidebarNav />
      <div className="subject-detail-page">
        {/* Main Content */}
        <main className="subject-main">
          {/* Header with Back Button and Title */}
          <div className="subject-main-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
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
            <h1 className="subject-detail-title">{subject.subjectName}</h1>
            <div className="header-spacer"></div>
          </div>

          {/* Overall Progress Card */}
          <div className="subject-progress-card">
            <div className="subject-progress-info">
              <h3>{t("subjectDetail.overallProgress")}</h3>
              <span className="progress-percent">{progress.percent}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress.percent}%`,
                  background: `linear-gradient(90deg, ${
                    subject.color || "#8AC0D5"
                  } 0%, ${adjustColor(subject.color || "#8AC0D5", 30)} 100%)`,
                }}
              ></div>
            </div>
            <div className="progress-hours">
              <span className="hours-text">
                {progress.completed}h / {progress.total}h
              </span>
            </div>
          </div>

          {/* Weekly Schedule */}
          <section className="weekly-schedule-section">
            <h2 className="subject-section-title">
              {t("subjectDetail.weeklySchedule")}
            </h2>
            <div className="schedule-list">
              {weeklySessions.length === 0 ? (
                <div className="subject-no-sessions">
                  {t("subjectDetail.noSessionsThisWeek")}
                </div>
              ) : (
                weeklySessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="schedule-item"
                    onClick={() => navigate(`/slot-detail/${session._id}`)}
                  >
                    <div
                      className="schedule-day"
                      style={{ backgroundColor: subject.color || "#8AC0D5" }}
                    >
                      <span className="day-name">
                        {getDayName(session.date)}
                      </span>
                    </div>
                    <div className="schedule-info">
                      <span className="schedule-time">
                        {formatTime(session.startTime)} -{" "}
                        {formatTime(session.endTime)}
                      </span>
                      <span className="schedule-duration">
                        {formatDuration(session.startTime, session.endTime)}
                      </span>
                    </div>
                    <span
                      className="schedule-status"
                      style={{ color: getStatusColor(session.status) }}
                    >
                      {getStatusText(session.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Upcoming Deadlines */}
          <section className="deadlines-section">
            <div className="section-header">
              <h2 className="subject-section-title">
                {t("subjectDetail.upcomingDeadlines")}
              </h2>
            </div>
            <div className="deadlines-list">
              {upcomingDeadlines.length === 0 ? (
                <div className="subject-no-deadlines">
                  {t("subjectDetail.noDeadlines")}
                </div>
              ) : (
                upcomingDeadlines.slice(0, 5).map((deadline, idx) => (
                  <div key={idx} className="deadline-item">
                    <div
                      className="deadline-indicator"
                      style={{
                        backgroundColor: getPriorityColor(
                          deadline.priorityLevel
                        ),
                      }}
                    ></div>
                    <div className="deadline-info">
                      <h4 className="deadline-title">{deadline.title}</h4>
                      <span className="deadline-due">
                        <span className="due-icon">
                          {getDaysUntilDue(deadline.dueDate) ===
                          t("subjectDetail.due.overdue")
                            ? "❗"
                            : "🕐"}
                        </span>
                        {getDaysUntilDue(deadline.dueDate)}
                      </span>
                    </div>
                    <span
                      className="deadline-priority"
                      style={{
                        color: getPriorityColor(deadline.priorityLevel),
                        backgroundColor: `${getPriorityColor(
                          deadline.priorityLevel
                        )}20`,
                      }}
                    >
                      {t(`subjectDetail.priorities.${deadline.priorityLevel}`)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Add Deadline Button */}
            <button
              className="add-deadline-btn"
              onClick={() => setShowAddDeadline(true)}
            >
              {t("subjectDetail.addDeadline")}
            </button>
          </section>
        </main>

        {/* Add Deadline Modal */}
        {showAddDeadline && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddDeadline(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{t("subjectDetail.addNewDeadline")}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowAddDeadline(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t("subjectDetail.title")}</label>
                  <input
                    type="text"
                    placeholder={t("subjectDetail.placeholder.title")}
                    value={newDeadline.title}
                    onChange={(e) =>
                      setNewDeadline({ ...newDeadline, title: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>{t("subjectDetail.dueDate")}</label>
                  <input
                    type="date"
                    value={newDeadline.dueDate}
                    onChange={(e) =>
                      setNewDeadline({
                        ...newDeadline,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>{t("subjectDetail.type")}</label>
                  <select
                    value={newDeadline.deadlineType}
                    onChange={(e) =>
                      setNewDeadline({
                        ...newDeadline,
                        deadlineType: e.target.value,
                      })
                    }
                  >
                    <option value="assignment">
                      {t("subjectDetail.deadlineTypes.assignment")}
                    </option>
                    <option value="exam">
                      {t("subjectDetail.deadlineTypes.exam")}
                    </option>
                    <option value="quiz">
                      {t("subjectDetail.deadlineTypes.quiz")}
                    </option>
                    <option value="project">
                      {t("subjectDetail.deadlineTypes.project")}
                    </option>
                    <option value="presentation">
                      {t("subjectDetail.deadlineTypes.presentation")}
                    </option>
                    <option value="midterm">
                      {t("subjectDetail.deadlineTypes.midterm")}
                    </option>
                    <option value="final">
                      {t("subjectDetail.deadlineTypes.final")}
                    </option>
                    <option value="other">
                      {t("subjectDetail.deadlineTypes.other")}
                    </option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t("subjectDetail.priority")}</label>
                  <select
                    value={newDeadline.priorityLevel}
                    onChange={(e) =>
                      setNewDeadline({
                        ...newDeadline,
                        priorityLevel: e.target.value,
                      })
                    }
                  >
                    <option value="low">
                      {t("subjectDetail.priorities.low")}
                    </option>
                    <option value="medium">
                      {t("subjectDetail.priorities.medium")}
                    </option>
                    <option value="high">
                      {t("subjectDetail.priorities.high")}
                    </option>
                    <option value="critical">
                      {t("subjectDetail.priorities.critical")}
                    </option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddDeadline(false)}
                >
                  {t("subjectDetail.cancel")}
                </button>
                <button
                  className="submit-btn"
                  onClick={handleAddDeadline}
                  disabled={!newDeadline.title || !newDeadline.dueDate}
                >
                  {t("subjectDetail.addDeadline")}
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
const adjustColor = (color, percent) => {
  if (!color) return "#8AC0D5";
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

export default SubjectDetail;
