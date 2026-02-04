import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import MoodCheckInModal from "../../components/mood/MoodCheckInModal";
import StudyTimer from "../../components/study/StudyTimer";
import NotificationBell from "../../components/notification/NotificationBell";
import PremiumBanner from "../../components/common/PremiumBanner";
import QuoteCard from "../../components/quote/QuoteCard";
import QuoteModal from "../../components/quote/QuoteModal";
import moodService from "../../services/moodService";
import { getVietnamTime, getVietnamDate } from "../../utils/helpers";
import { getRandomAISuggestion } from "../../utils/aiSuggestions";
import config from "../../config";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [studyProgress, setStudyProgress] = useState({ current: 0, goal: 360 });
  const [streak, setStreak] = useState(12);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [missedSessions, setMissedSessions] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = getVietnamTime().getHours();
    if (hour < 12) return t("dashboard.goodMorning");
    if (hour < 18) return t("dashboard.goodAfternoon");
    return t("dashboard.goodEvening");
  };

  // Fetch active session
  const fetchActiveSession = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${config.apiUrl}/study-sessions/active`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActiveSession(data);
      }
    } catch (error) {
    }
  }, []);

  // Fetch missed sessions from today
  const fetchMissedSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await fetch(
        `${config.apiUrl}/study-sessions?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}&status=missed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMissedSessions(data);
      }
    } catch (error) {
    }
  }, []);

  // Handle session end
  const handleSessionEnd = (data) => {
    setActiveSession(null);
    // Refresh dashboard data
    fetchDashboardData();
    // Show success message or notification
    alert(
      `🎉 ${t("dashboard.congratulations")} ${data.stats.actualDuration} ${t(
        "dashboard.minutesStudy"
      )}`
    );
  };

  useEffect(() => {
    setGreeting(getGreeting());
    loadCachedData();
    fetchDashboardData();
    fetchActiveSession();
    fetchMissedSessions();
    checkMoodCheckIn();

    // Poll for active session every 30 seconds
    const interval = setInterval(() => {
      fetchActiveSession();
      fetchMissedSessions();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh AI suggestion when language changes
  useEffect(() => {
    const suggestion = getRandomAISuggestion(i18n.language, {
      progressPercent: (studyProgress.current / studyProgress.goal) * 100,
      completedMinutes: studyProgress.current,
      upcomingSessionsCount: upcomingSessions.length,
      consecutiveStudyMinutes: studyProgress.current,
    });
    if (suggestion) {
      setAiSuggestion(suggestion);
    }
  }, [i18n.language]);

  // Check if user needs mood check-in
  const checkMoodCheckIn = async () => {
    const lastSkipped = localStorage.getItem("moodCheckInSkipped");
    const today = new Date().toDateString();

    // Don't show if already skipped today
    if (lastSkipped === today) return;

    try {
      const response = await moodService.getTodayMood();
      // Show modal if no mood entry today
      if (!response.data) {
        setTimeout(() => setShowMoodModal(true), 2000); // Show after 2 seconds
      }
    } catch (error) {
    }
  };

  // Load cached data immediately for instant display
  const loadCachedData = () => {
    const storedUser = localStorage.getItem("user");
    const cachedDashboard = localStorage.getItem("dashboardData");

    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    if (cachedDashboard) {
      const data = JSON.parse(cachedDashboard);
      setStudyProgress(data.studyProgress || { current: 0, goal: 360 });
      setStreak(data.streak || 0);
      setUpcomingSessions(data.upcomingSessions || []);
      
      // Always generate a fresh random suggestion on load
      const progressPercent = ((data.studyProgress?.current || 0) / (data.studyProgress?.goal || 360)) * 100;
      const freshSuggestion = getRandomAISuggestion(i18n.language, {
        progressPercent,
        completedMinutes: data.studyProgress?.current || 0,
        upcomingSessionsCount: data.upcomingSessions?.length || 0,
        consecutiveStudyMinutes: data.studyProgress?.current || 0,
      });
      
      // Fallback if suggestion is empty
      const fallbackText = i18n.language?.startsWith('en') 
        ? "Believe in yourself! You can do this 🌟"
        : "Hãy tin vào bản thân! Bạn có thể làm được điều này 🌟";
      setAiSuggestion(freshSuggestion || fallbackText);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch user data first
      const userResponse = await fetch(
        `${config.apiUrl}/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let currentUser = null;
      if (userResponse.ok) {
        currentUser = await userResponse.json();
        setUserData(currentUser);
        setStreak(currentUser.streakCount || 0);
        localStorage.setItem("user", JSON.stringify(currentUser));
      }

      // Get today's date range
      const today = getVietnamDate();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));

      // Fetch today's study sessions for time tracking
      const sessionsResponse = await fetch(
        `${config.apiUrl}/study-sessions/today?start=${todayStart.toISOString()}&end=${todayEnd.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let todaySessions = [];
      let completedMinutes = 0;
      let goalMinutes = 360; // Default 6 hours

      if (sessionsResponse.ok) {
        todaySessions = await sessionsResponse.json();

        // Calculate completed study time from TODAY's sessions
        completedMinutes = todaySessions
          .filter((s) => s.status === "completed")
          .reduce((total, session) => {
            const plannedDuration = session.plannedDuration || 90;
            const actualDuration = session.actualDuration || plannedDuration;
            // Sum up actual duration of all completed sessions
            return total + actualDuration;
          }, 0);

        // Calculate goal from all scheduled sessions today
        goalMinutes =
          todaySessions.reduce((total, session) => {
            return total + (session.plannedDuration || 90);
          }, 0) || 360;

        // Cap total completed at total goal to avoid showing more than 100%
        completedMinutes = Math.min(completedMinutes, goalMinutes);
      }

      // Fetch upcoming sessions by subject (current semester)
      const upcomingResponse = await fetch(
        `${config.apiUrl}/study-sessions/upcoming-by-subject`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let upcomingSessions = [];

      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();

        // Map to display format with full date and time
        upcomingSessions = upcomingData
          .slice(0, 3) // Show max 3 subjects
          .map((session) => {
            const sessionDate = new Date(session.date);
            const dayOfWeek = sessionDate.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const monthDay = sessionDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const year = sessionDate.getFullYear();

            return {
              id: session._id,
              subjectId: session.subjectInfo?._id || session.subjectId,
              subject:
                session.subjectInfo?.subjectName || t("dashboard.studySession"),
              time: `${dayOfWeek}, ${monthDay} ${year} • ${session.startTime} - ${session.endTime}`,
              color: session.subjectInfo?.color || "#8AC0D5",
            };
          });
      }

      // Generate AI suggestion based on progress and context
      const progressPercent = (completedMinutes / goalMinutes) * 100;
      
      // Get random AI suggestion with context - pass language from i18n
      const suggestion = getRandomAISuggestion(i18n.language, {
        progressPercent,
        completedMinutes,
        upcomingSessionsCount: upcomingSessions.length,
        consecutiveStudyMinutes: completedMinutes,
      });
      
      // Fallback if suggestion is empty
      const fallbackMsg = i18n.language?.startsWith('en') 
        ? "Believe in yourself! You can do this 🌟"
        : "Hãy tin vào bản thân! Bạn có thể làm được điều này 🌟";
      const finalSuggestion = suggestion || fallbackMsg;

      const dashboardData = {
        studyProgress: { current: completedMinutes, goal: goalMinutes },
        streak: currentUser?.streakCount || 0,
        upcomingSessions:
          upcomingSessions.length > 0
            ? upcomingSessions
            : [
                {
                  id: "placeholder1",
                  subject: t("dashboard.noSessions"),
                  time: t("dashboard.enjoyFreeTime"),
                  color: "#8AC0D5",
                },
              ],
        aiSuggestion: finalSuggestion,
      };

      setStudyProgress(dashboardData.studyProgress);
      setUpcomingSessions(dashboardData.upcomingSessions);
      setAiSuggestion(finalSuggestion);

      // Cache dashboard data
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));
    } catch (error) {
      // Fallback to mock data on error
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const fallbackData = {
        studyProgress: { current: 0, goal: 360 },
        streak: 12,
        upcomingSessions: [
          {
            id: "fallback1",
            subject: t("dashboard.serverNotRunning"),
            time: t("dashboard.pleaseStartServer"),
            color: "#FF6B6B",
          },
        ],
        aiSuggestion: t("dashboard.unableToConnect"),
      };
      setStudyProgress(fallbackData.studyProgress);
      setUpcomingSessions(fallbackData.upcomingSessions);
      setAiSuggestion(fallbackData.aiSuggestion);
    }
  };

  const progressPercentage = (studyProgress.current / studyProgress.goal) * 100;

  return (
    <div className="dashboard-container">
      {/* Premium Banner */}
      <PremiumBanner />
      
      {/* Sidebar Navigation - Desktop Only */}
      <SidebarNav />

      {/* Main Wrapper */}
      <div className="dashboard-wrapper">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <img
              src={userData?.avatarUrl || "https://i.pravatar.cc/150?img=1"}
              alt="Profile"
              className="profile-avatar"
              onClick={() => navigate('/profile', { state: { from: '/dashboard' } })}
              style={{ cursor: 'pointer' }}
              title={t("dashboard.viewProfile") || "Xem thông tin cá nhân"}
            />
            <div className="header-text">
              <h1 className="greeting">{greeting}</h1>
              <p className="username">{userData?.name || t("common.user")}</p>
            </div>
          </div>
          <NotificationBell />
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-grid">
            {/* Left Column */}
            <div className="dashboard-left-col">
              {/* Streak Card */}
              <div className="streak-card gradient-card">
                <div className="streak-content">
                  <div className="streak-info">
                    <p className="streak-label">
                      {t("dashboard.currentStreak")}
                    </p>
                    <h2 className="streak-days">
                      {streak} {t("dashboard.days")}
                    </h2>
                  </div>
                  <div className="streak-icon">🔥</div>
                </div>
              </div>

              {/* Quote Card - Standalone */}
              <QuoteCard 
                onClick={() => setShowQuoteModal(true)} 
                currentQuote={currentQuote}
                onQuoteChange={setCurrentQuote}
              />

              {/* Missed Sessions Alert */}
              {missedSessions.length > 0 && (
                <section className="missed-section">
                  <div className="missed-alert">
                    <div className="missed-icon">⚠️</div>
                    <div className="missed-content">
                      <h3 className="missed-title">
                        {t("dashboard.missedSession")}
                      </h3>
                      <p className="missed-text">
                        {t("dashboard.missedSessionText")}{" "}
                        <strong>
                          {missedSessions[0].subjectId?.subjectName ||
                            t("dashboard.aSession")}
                        </strong>{" "}
                        {t("dashboard.asMissed")}
                        {missedSessions[0].startTime &&
                          missedSessions[0].endTime && (
                            <span>
                              {" "}
                              ({missedSessions[0].startTime} -{" "}
                              {missedSessions[0].endTime})
                            </span>
                          )}
                      </p>
                      {missedSessions.length > 1 && (
                        <p className="missed-count">
                          +{missedSessions.length - 1}{" "}
                          {t("dashboard.moreMissedToday")}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Active Study Timer */}
              {activeSession && (
                <StudyTimer
                  session={activeSession}
                  onEnd={handleSessionEnd}
                  onRefresh={fetchActiveSession}
                />
              )}
            </div>

            {/* Right Column */}
            <div className="dashboard-right-col">

              {/* Today's Progress */}
              <section className="progress-section">
                <h2 className="section-title">
                  {t("dashboard.todaysProgress")}
                </h2>
                {studyProgress.goal === 0 || upcomingSessions.length === 0 ? (
                  <div className="progress-card free-day-card">
                    <div className="free-day-content">
                      <span className="free-day-emoji">🌟</span>
                      <span className="free-day-text">Enjoy your free day</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="progress-card"
                    onClick={() => navigate("/study-tracker")}
                    style={{ cursor: "pointer" }}
                    title={`${Math.floor(studyProgress.current / 60)}h ${studyProgress.current % 60}m / ${Math.floor(studyProgress.goal / 60)}h`}
                  >
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                      >
                        <span className="progress-tooltip">
                          {Math.floor(studyProgress.current / 60)}h{" "}
                          {studyProgress.current % 60}m /{" "}
                          {Math.floor(studyProgress.goal / 60)}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Upcoming Sessions */}
              <section className="dashboard-sessions">
                <h2 className="section-title">
                  {t("dashboard.upcomingSessions")}
                </h2>
                <div className="dashboard-dashboard-sessions-list">
                  {upcomingSessions.length > 0 && upcomingSessions[0].subject !== t("dashboard.noSessions") ? (
                    upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="dashboard-session-card"
                        onClick={() =>
                          session.subjectId &&
                          navigate(`/subject/${session.subjectId}`)
                        }
                        style={{
                          cursor: session.subjectId ? "pointer" : "default",
                        }}
                      >
                        <div className="dashboard-session-left">
                          <div
                            className="dashboard-session-indicator"
                            style={{ backgroundColor: session.color }}
                          ></div>
                          <div className="dashboard-session-info">
                            <h3 className="dashboard-session-subject">
                              {session.subject}
                            </h3>
                            <p className="dashboard-session-time">
                              {session.time}
                            </p>
                          </div>
                        </div>
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ))
                  ) : (
                    <div 
                      className="dashboard-session-card ai-generator-suggestion"
                      onClick={() => navigate("/ai-generator")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="dashboard-session-left">
                        <div
                          className="dashboard-session-indicator"
                          style={{ backgroundColor: "#FF69B4" }}
                        ></div>
                        <div className="dashboard-session-info">
                          <h3 className="dashboard-session-subject">
                            {t("dashboard.noSessions")}
                          </h3>
                          <p className="dashboard-session-time">
                            {t("dashboard.createWithAI")}
                          </p>
                        </div>
                      </div>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M9 18L15 12L9 6"
                          stroke="#FF69B4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* AI Suggestion - Full Width */}
          <section className="ai-section ai-section-full">
            <h2 className="section-title">{t("dashboard.aiSuggestion")}</h2>
            <div 
              className="ai-card gradient-card"
              onClick={() => navigate("/ai")}
              style={{ cursor: "pointer" }}
            >
              <div className="ai-icon">
                <img src="/LogoAIStechdy.png" alt="AI Stechdy" style={{width: '80px', height: '80px'}} />
              </div>
              <p className="ai-text">{aiSuggestion}</p>
            </div>
          </section>

        </main>

        {/* Mood Check-in Modal */}
        <MoodCheckInModal
          isOpen={showMoodModal}
          onClose={() => setShowMoodModal(false)}
        />

        {/* Quote Modal */}
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          currentQuote={currentQuote}
          onQuoteChange={setCurrentQuote}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;
