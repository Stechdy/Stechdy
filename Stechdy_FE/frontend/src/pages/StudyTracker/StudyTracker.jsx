import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import NotificationBell from "../../components/notification/NotificationBell";
import { getVietnamTime, getVietnamDate } from "../../utils/helpers";
import "./StudyTracker.css";

const WaterDrop = ({ percentage, day, date, isToday, onClick }) => {
  const fillHeight = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div 
      className={`streak-day ${isToday ? 'today' : ''}`} 
      onClick={onClick}
    >
      <div 
        className="water-fill"
        style={{ height: `${fillHeight}%` }}
      />
      <div className="day-content">
        <div className="day-number">{date}</div>
      </div>
    </div>
  );
};

const StudyTracker = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0); // For Weekly Schedule
  const [currentWeekNumber, setCurrentWeekNumber] = useState(1);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0); // For Streak Calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthSessions, setMonthSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [todayProgress, setTodayProgress] = useState([]);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    totalHours: 0,
    calendar: [],
    streakHistory: [],
    lastActiveDate: null,
  });

  useEffect(() => {
    fetchWeeklySchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => {
    fetchMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset]);

  const fetchWeeklySchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch weekly schedule
      const scheduleResponse = await fetch(
        `http://localhost:3001/api/study-sessions/week?offset=${weekOffset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (scheduleResponse.ok) {
        const data = await scheduleResponse.json();
        console.log('Week schedule:', data);
        setWeekSchedule(data.sessions || []);
        setCurrentWeekNumber(data.weekNumber || 1);
      }
    } catch (error) {
      console.error("Error fetching weekly schedule:", error);
    }
  };

  const fetchMonthData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch subjects
      const subjectsResponse = await fetch(
        "http://localhost:3001/api/subjects",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData);
      }

      // Calculate month range
      const today = getVietnamDate();
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
      const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      setCurrentMonth(targetMonth);

      // Fetch month sessions
      const scheduleResponse = await fetch(
        `http://localhost:3001/api/study-sessions/range?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (scheduleResponse.ok) {
        const sessions = await scheduleResponse.json();
        console.log('Month sessions:', sessions);
        setMonthSessions(sessions || []);
      }

      // Fetch today's progress
      const todayDate = getVietnamDate();
      const todayStart = new Date(todayDate.setHours(0, 0, 0, 0));
      const todayEnd = new Date(todayDate.setHours(23, 59, 59, 999));

      const progressResponse = await fetch(
        `http://localhost:3001/api/study-sessions/today?start=${todayStart.toISOString()}&end=${todayEnd.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (progressResponse.ok) {
        const sessions = await progressResponse.json();
        const progressBySubject = calculateProgressBySubject(sessions);
        setTodayProgress(progressBySubject);
      }

      // Fetch streak data
      const streakResponse = await fetch(
        "http://localhost:3001/api/users/streak",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (streakResponse.ok) {
        const streak = await streakResponse.json();
        setStreakData(streak);
      }
    } catch (error) {
      console.error("Error fetching month data:", error);
    }
  };

  const calculateProgressBySubject = (sessions) => {
    // Calculate total progress for today instead of by subject
    let totalCompleted = 0;
    let totalGoal = 0;

    sessions.forEach((session) => {
      const plannedDuration = session.plannedDuration || 90;
      totalGoal += plannedDuration;

      if (session.status === "completed") {
        // Sum up actual duration of all completed sessions
        const actualDuration = session.actualDuration || plannedDuration;
        totalCompleted += actualDuration;
      }
    });

    // Cap total completed at total goal to avoid showing more than 100%
    totalCompleted = Math.min(totalCompleted, totalGoal);

    // Return single item for total progress
    if (totalGoal === 0) return [];

    return [
      {
        subjectKey: "studyTracker.totalStudyTime",
        completed: totalCompleted,
        goal: totalGoal,
        color: "#8AC0D5",
      },
    ];
  };

  const getWeekDates = () => {
    const today = getVietnamDate();
    const currentDayOfWeek = today.getDay();
    const daysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + daysToMonday);
    currentMonday.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(currentMonday);
    weekStart.setDate(currentMonday.getDate() + (weekOffset * 7));
    
    const dates = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push({
        day: dayNames[i],
        date: date.getDate(),
        fullDate: date.toISOString().split('T')[0],
      });
    }
    
    return dates;
  };

  const getMonthDates = () => {
    const dates = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = firstDay.getDay();
    const mondayOffset = startDay === 0 ? 6 : startDay - 1;
    
    // Add empty slots for days before month starts (to align with Monday start)
    for (let i = 0; i < mondayOffset; i++) {
      dates.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
      dates.push({
        day: dayOfWeek,
        date: day,
        fullDate: date.toISOString().split('T')[0],
      });
    }
    
    return dates;
  };

  const getDayProgress = (dayDate) => {
    if (!dayDate) return 0;
    
    // Check if the day is in the future
    const now = getVietnamTime();
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    if (dayEnd > now) {
      return 0;
    }
    
    // Get all completed sessions for this specific day
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const daySessions = monthSessions.filter(session => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === dayStart.getTime() && session.status === 'completed';
    });
    
    if (daySessions.length === 0) return 0;
    
    // Calculate total actual study time in minutes
    let totalMinutes = 0;
    daySessions.forEach(session => {
      totalMinutes += session.actualDuration || 0;
    });
    
    // Convert to percentage (assume 8 hours = 480 minutes = 100%)
    const targetMinutesPerDay = 480; // 8 hours
    const percentage = Math.min((totalMinutes / targetMinutesPerDay) * 100, 100);
    
    return percentage;
  };

  // For Weekly Schedule - use weekSchedule
  const getWeekSessionStatus = (fullDate, timeSlot) => {
    if (!fullDate) return "no-slot";
    
    const session = weekSchedule.find((s) => {
      const sessionDate = new Date(s.date).toISOString().split('T')[0];
      return sessionDate === fullDate && s.timeSlot === timeSlot;
    });

    if (!session) return "no-slot";

    // Check if session is in the future by comparing date + end time
    const sessionDate = new Date(session.date);
    const [endHour, endMinute] = (session.endTime || "23:59")
      .split(":")
      .map(Number);
    sessionDate.setHours(endHour, endMinute, 0, 0);

    const now = getVietnamTime();

    // Future sessions or sessions that haven't ended yet = scheduled
    if (sessionDate > now) {
      return "scheduled";
    }

    // Past sessions - check actual status
    if (session.status === "completed") return "present";
    if (session.status === "cancelled" || session.status === "missed")
      return "absent";

    // Past but not marked = absent (missed)
    return "absent";
  };

  const getWeekSessionColor = (fullDate, timeSlot) => {
    if (!fullDate) return "#8AC0D5";
    
    const session = weekSchedule.find((s) => {
      const sessionDate = new Date(s.date).toISOString().split('T')[0];
      return sessionDate === fullDate && s.timeSlot === timeSlot;
    });
    return session?.subjectInfo?.color || "#8AC0D5";
  };

  const renderStatusIcon = (status, color) => {
    if (status === "no-slot") {
      return <div className="status-icon no-slot">−</div>;
    }
    if (status === "absent") {
      return (
        <div className="status-icon absent" style={{ backgroundColor: color }}>
          ×
        </div>
      );
    }
    if (status === "scheduled") {
      return (
        <div
          className="status-icon scheduled"
          style={{ backgroundColor: color }}
        >
          −
        </div>
      );
    }
    return (
      <div className="status-icon present" style={{ backgroundColor: color }}>
        ✓
      </div>
    );
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();
  const timeSlotKeys = [
    "studyTracker.timeSlots.morning",
    "studyTracker.timeSlots.afternoon",
    "studyTracker.timeSlots.evening",
  ];
  const timeSlots = ["Mor", "Aft", "Eve"];

  return (
    <div className="study-tracker-container">
      <SidebarNav />
      <div className="study-tracker">
        <header className="tracker-header">
          <div className="header-spacer"></div>
          <h1 className="tracker-page-title">{t("studyTracker.title")}</h1>
          <NotificationBell />
        </header>

        {/* Main Content */}
        <main className="tracker-main">
          {/* Weekly Schedule */}
          <section className="weekly-schedule">
            <div className="schedule-header">
              <h2>{t("studyTracker.weeklySchedule")}</h2>
              <div className="week-navigation">
                <button onClick={() => setWeekOffset(weekOffset - 1)}>‹</button>
                <span>
                  {t("studyTracker.week")} {currentWeekNumber}
                </span>
                <button onClick={() => setWeekOffset(weekOffset + 1)}>›</button>
              </div>
            </div>

            <div className="schedule-grid">
              <div className="schedule-row header-row">
                <div className="time-slot-label"></div>
                {weekDates.map((day, idx) => {
                  if (!day) return <div key={idx} className="empty-day"></div>;
                  
                  const today = getVietnamDate();
                  today.setHours(0, 0, 0, 0);
                  const dayDate = new Date(day.fullDate);
                  dayDate.setHours(0, 0, 0, 0);
                  const isToday = dayDate.getTime() === today.getTime();

                  return (
                    <div
                      key={idx}
                      className={`day-header ${isToday ? "today" : ""}`}
                    >
                      <div className="day-name">{day.day}</div>
                      <div className="day-date">{day.date}</div>
                    </div>
                  );
                })}
              </div>

              {timeSlots.map((slot, slotIdx) => (
                <div key={slotIdx} className="schedule-row">
                  <div className="time-slot-label">
                    {t(timeSlotKeys[slotIdx])}
                  </div>
                  {weekDates.map((day, dayIdx) => {
                    const status = getWeekSessionStatus(day.fullDate, slot);
                    const color = getWeekSessionColor(day.fullDate, slot);
                    return (
                      <div key={dayIdx} className="schedule-cell">
                        {renderStatusIcon(status, color)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="schedule-legend">
              <div className="legend-item">
                <div className="legend-icon present">✓</div>
                <span>{t("studyTracker.present")}</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon absent">×</div>
                <span>{t("studyTracker.absent")}</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon no-slot">−</div>
                <span>{t("studyTracker.noSlot")}</span>
              </div>
            </div>
          </section>

          {/* Subject Legend */}
          <section className="subject-legend">
            <h3>{t("studyTracker.subjectLegend")}</h3>
            <div className="subjects-grid">
              {subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className="subject-item"
                  onClick={() => navigate(`/subject/${subject._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="subject-color"
                    style={{ backgroundColor: subject.color }}
                  ></div>
                  <span>{subject.subjectName}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Today's Progress */}
          <section className="today-progress">
            <h3>{t("studyTracker.todaysProgress")}</h3>
            {todayProgress.map((item, idx) => (
              <div key={idx} className="progress-item">
                <div className="progress-header">
                  <div className="progress-label">
                    <div
                      className="progress-dot"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>
                      {item.subjectKey ? t(item.subjectKey) : item.subject}
                    </span>
                  </div>
                  <span className="progress-time">
                    {Math.floor(item.completed / 60)}h {item.completed % 60}m /{" "}
                    {Math.floor(item.goal / 60)}h
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(
                        (item.completed / item.goal) * 100,
                        100
                      )}%`,
                      backgroundColor: item.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </section>

          {/* Study Streak Calendar */}
          <section className="streak-calendar">
            <div className="streak-header">
              <h3>{t("studyTracker.streakCalendar")}</h3>
              <div className="week-navigation">
                <button onClick={() => setMonthOffset(monthOffset - 1)}>‹</button>
                <span>
                  {currentMonth.toLocaleDateString(i18n.language || 'en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => setMonthOffset(monthOffset + 1)}>›</button>
              </div>
            </div>
            
            <div className="water-drops-grid">
              {monthDates.map((dayInfo, idx) => {
                // Handle empty days (null values for alignment)
                if (!dayInfo) {
                  return <div key={idx} className="empty-day"></div>;
                }
                
                const today = getVietnamDate();
                today.setHours(0, 0, 0, 0);
                const dayDate = new Date(dayInfo.fullDate);
                dayDate.setHours(0, 0, 0, 0);
                const isToday = dayDate.getTime() === today.getTime();
                const progress = getDayProgress(dayInfo.fullDate);
                
                return (
                  <WaterDrop
                    key={idx}
                    percentage={progress}
                    day={dayInfo.day}
                    date={dayInfo.date}
                    isToday={isToday}
                    onClick={() => {
                      // Optional: Navigate to day detail
                    }}
                  />
                );
              })}
            </div>

            {/* Streak Stats */}
            <div className="streak-stats">
              <div className="streak-stat-item">
                <span className="streak-icon">🔥</span>
                <div className="streak-stat-info">
                  <span className="streak-stat-value">
                    {streakData.currentStreak || 0}
                  </span>
                  <span className="streak-stat-label">
                    {t("studyTracker.currentStreak")}
                  </span>
                </div>
              </div>
              <div className="streak-stat-item">
                <span className="streak-icon">🏆</span>
                <div className="streak-stat-info">
                  <span className="streak-stat-value">
                    {streakData.longestStreak || 0}
                  </span>
                  <span className="streak-stat-label">
                    {t("studyTracker.longestStreak")}
                  </span>
                </div>
              </div>
              <div className="streak-stat-item">
                <span className="streak-icon">📅</span>
                <div className="streak-stat-info">
                  <span className="streak-stat-value">
                    {streakData.totalActiveDays || 0}
                  </span>
                  <span className="streak-stat-label">
                    {t("studyTracker.totalDays")}
                  </span>
                </div>
              </div>
              <div className="streak-stat-item">
                <span className="streak-icon">⏱️</span>
                <div className="streak-stat-info">
                  <span className="streak-stat-value">
                    {streakData.totalHours || 0}h
                  </span>
                  <span className="streak-stat-label">
                    {t("studyTracker.studyHours")}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default StudyTracker;
