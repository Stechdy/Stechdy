import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import MoodCalendar from "../../components/mood/MoodCalendar";
import StreakMilestones from "../../components/mood/StreakMilestones";
import moodService from "../../services/moodService";
import "./MoodHistory.css";

const MoodHistory = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    loadStats();
  }, []);

  // Reload stats when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      loadStats();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Update language when it changes
  useEffect(() => {
    const newLang = localStorage.getItem("language") || i18n.language || "en";
    setCurrentLang(newLang);
  }, [i18n.language]);

  // Direct mapping for emotion translations
  const emotionTranslations = {
    vi: {
      Tired: "Mệt mỏi",
      Frustrated: "Thất vọng",
      Happy: "Vui vẻ",
      Excited: "Phấn khích",
      Confident: "Tự tin",
      Anxious: "Lo lắng",
      Stressed: "Căng thẳng",
      Motivated: "Có động lực",
      Overwhelmed: "Choáng ngợp",
      Calm: "Bình tĩnh",
      Sad: "Buồn",
      Energetic: "Năng động",
      Peaceful: "Yên bình",
      Angry: "Tức giận",
      Grateful: "Biết ơn",
      Hopeful: "Hy vọng",
      Confused: "Bối rối",
      Focused: "Tập trung",
      Relaxed: "Thư giãn",
      Worried: "Lo lắng",
    },
  };

  // Helper function to translate emotion names
  const translateEmotion = (emotion) => {
    // Use currentLang state
    if (currentLang.startsWith("vi") && emotionTranslations.vi[emotion]) {
      return emotionTranslations.vi[emotion];
    }
    return emotion;
  };

  const loadStats = async () => {
    try {
      const response = await moodService.getMoodStats(30);
      if (response.success) {
        setStats(response.data);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (avgMood) => {
    if (avgMood >= 4.5) return "😄";
    if (avgMood >= 3.5) return "😊";
    if (avgMood >= 2.5) return "😐";
    if (avgMood >= 1.5) return "😔";
    return "😢";
  };

  return (
    <div className="mood-history-page">
      <SidebarNav />
      <div className="mood-history-wrapper">
        <div className="mood-history-content">
          {/* Page Title */}
          <h1 className="mood-history-page-title">{t("mood.history")}</h1>

          {/* Loading State */}
          {loading && (
            <div className="mood-history-loading-section">
              <div className="mood-history-loading-spinner"></div>
              <p>{t("common.loading")}</p>
            </div>
          )}

          {/* Stats Cards Section */}
          {!loading && stats && stats.totalEntries > 0 && (
            <div className="mood-history-stats-card">
              <div className="mood-history-stats-grid">
                <div className="mood-history-stat-item">
                  <div className="mood-history-stat-icon-wrapper mood-history-icon-bg-pink">
                    <span className="mood-history-stat-emoji">{getMoodEmoji(stats.avgMood)}</span>
                  </div>
                  <div className="mood-history-stat-info">
                    <span className="mood-history-stat-label">
                      {t("moodHistory.averageMood")}
                    </span>
                    <span className="mood-history-stat-value">
                      {stats.avgMood.toFixed(1)}/5
                    </span>
                  </div>
                </div>

                <div className="mood-history-stat-item">
                  <div className="mood-history-stat-icon-wrapper mood-history-icon-bg-yellow">
                    <span className="mood-history-stat-emoji">⚡</span>
                  </div>
                  <div className="mood-history-stat-info">
                    <span className="mood-history-stat-label">
                      {t("moodHistory.averageEnergy")}
                    </span>
                    <span className="mood-history-stat-value">
                      {stats.avgEnergy.toFixed(1)}/10
                    </span>
                  </div>
                </div>

                <div className="mood-history-stat-item">
                  <div className="mood-history-stat-icon-wrapper mood-history-icon-bg-blue">
                    <span className="mood-history-stat-emoji">📊</span>
                  </div>
                  <div className="mood-history-stat-info">
                    <span className="mood-history-stat-label">
                      {t("moodHistory.totalEntries")}
                    </span>
                    <span className="mood-history-stat-value">{stats.totalEntries}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streak & Milestones Section */}
          {!loading && <StreakMilestones />}

          {/* Empty State */}
          {!loading && stats && stats.totalEntries === 0 && (
            <div className="mood-history-empty-state-card">
              <div className="mood-history-empty-icon">📊</div>
              <h3>{t("moodHistory.noDataYet")}</h3>
              <p>{t("moodHistory.startTracking")}</p>
              <button className="mood-history-start-btn" onClick={() => navigate("/mood")}>
                {t("moodHistory.startNow")}
              </button>
            </div>
          )}

          {/* Calendar Section */}
          <div className="mood-history-calendar-card">
            <h2 className="mood-history-card-section-title">{t("moodHistory.moodCalendar")}</h2>
            <MoodCalendar />
          </div>

          {/* Top Emotions Section */}
          {!loading && stats && stats.topEmotions.length > 0 && (
            <div className="mood-history-emotions-card">
              <h2 className="mood-history-card-section-title">
                {t("moodHistory.commonEmotions")}
              </h2>
              <div className="mood-history-emotion-list">
                {stats.topEmotions.map((emotion, index) => (
                  <div key={index} className="mood-history-emotion-item">
                    <span className="mood-history-emotion-name">
                      {translateEmotion(emotion.emotion)}
                    </span>
                    <div className="mood-history-emotion-bar-container">
                      <div
                        className="mood-history-emotion-bar"
                        style={{
                          width: `${
                            (emotion.count / stats.totalEntries) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="mood-history-emotion-count">{emotion.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Mood Button */}
          <button
            className="mood-history-add-mood-fab"
            onClick={() => navigate("/mood")}
            title={t("moodHistory.addNewEntry")}
          >
            <span className="mood-history-fab-icon">+</span>
            <span className="mood-history-fab-label">{t("moodHistory.addMood")}</span>
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default MoodHistory;
