import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import moodService from "../../services/moodService";
import browserNotificationService from "../../services/browserNotificationService";
import CelebrationModal from "../common/CelebrationModal";
import "./StreakMilestones.css";

// Import mood images
import upsetImg from "../../assets/Upset.png";
import sadImg from "../../assets/Sad.png";
import normalImg from "../../assets/Normal.png";
import happyImg from "../../assets/Happy.png";
import veryHappyImg from "../../assets/Veryhappy.png";


const StreakMilestones = () => {
  const { t } = useTranslation();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [makeupDate, setMakeupDate] = useState('');
  const [makeupMoodData, setMakeupMoodData] = useState({
    mood: 3,
    emotionTags: [],
    note: '',
    energyLevel: 5
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [celebration, setCelebration] = useState({
    show: false,
    emoji: "",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadStreakData();
    
    // Listen for streak updates from other components
    const handleStreakUpdate = () => {
      console.log('Streak updated event received, reloading streak data...');
      loadStreakData();
    };
    
    window.addEventListener('streakUpdated', handleStreakUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('streakUpdated', handleStreakUpdate);
    };
  }, []);

  useEffect(() => {
    // Request notification permission on mount
    if (streakData) {
      browserNotificationService.requestPermission().then(granted => {
        if (granted) {
          // Setup streak reminders
          browserNotificationService.setupStreakReminders(streakData);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      browserNotificationService.clearStreakReminders();
    };
  }, [streakData]);

  const loadStreakData = async () => {
    try {
      const response = await moodService.getStreakInfo();
      if (response.success) {
        setStreakData(response.data);
      }
    } catch (error) {
      console.error("Error loading streak data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
    setShowMilestoneModal(true);
  };

  const closeMilestoneModal = () => {
    setShowMilestoneModal(false);
    setTimeout(() => setSelectedMilestone(null), 300);
  };

  const closeAllMilestonesModal = () => {
    setShowAllMilestones(false);
  };

  const handleRewardsCardClick = () => {
    setShowAllMilestones(true);
  };

  const handleMakeupClick = () => {
    setShowMakeupModal(true);
  };

  const closeMakeupModal = () => {
    setShowMakeupModal(false);
    setMakeupDate('');
    setMakeupMoodData({
      mood: 3,
      emotionTags: [],
      note: '',
      energyLevel: 5
    });
  };

  const handleMakeupSubmit = async () => {
    if (!makeupDate) {
      alert(t("streak.selectDateFirst"));
      return;
    }

    try {
      const response = await moodService.makeupMoodCheckIn({
        date: makeupDate,
        ...makeupMoodData
      });

      if (response.success) {
        // Close modal first
        closeMakeupModal();
        
        // Reload streak data
        loadStreakData();
        
        // Check for milestones and show celebration
        const hasNewMilestones = response.data?.newMilestones && response.data.newMilestones.length > 0;
        const currentStreak = response.data?.currentStreak;

        if (hasNewMilestones) {
          // Determine celebration content
          const milestone = response.data.newMilestones[0];
          const celebrationEmoji = milestone.emoji || "🎖️";
          const celebrationTitle = milestone.name || t("celebration.newMilestone");
          const celebrationMessage = milestone.description || t("celebration.streakAchieved", { days: currentStreak });

          // Show celebration
          setCelebration({
            show: true,
            emoji: celebrationEmoji,
            title: celebrationTitle,
            message: celebrationMessage,
          });

          // Close celebration after 6.5 seconds
          setTimeout(() => {
            setCelebration({ show: false, emoji: "", title: "", message: "" });
          }, 6500);
          
          // Show browser notification
          response.data.newMilestones.forEach(milestone => {
            browserNotificationService.notifyMilestoneUnlocked(milestone);
          });
        } else {
          // No milestone, show success popup
          const remainingMakeups = response.data?.remainingMakeups || 0;
          setSuccessMessage(t("streak.makeupSuccessMessage", { remaining: remainingMakeups }));
          setShowSuccessPopup(true);
        }
      }
    } catch (error) {
      console.error("Error making makeup check-in:", error);
      // Close modal first
      closeMakeupModal();
      
      // Then show error popup
      setSuccessMessage(error.response?.data?.message || t("streak.makeupError"));
      setShowSuccessPopup(true);
    }
  };

  // Mood options with images (same as Mood page)
  const moods = [
    { value: 1, image: upsetImg, label: t("mood.moods.upset") || "Buồn" },
    { value: 2, image: sadImg, label: t("mood.moods.sad") || "Hơi buồn" },
    { value: 3, image: normalImg, label: t("mood.moods.normal") || "Bình thường" },
    { value: 4, image: happyImg, label: t("mood.moods.happy") || "Vui" },
    { value: 5, image: veryHappyImg, label: t("mood.moods.veryHappy") || "Rất vui" },
  ];

  if (loading) {
    return (
      <div className="streak-milestones-loading">
        <div className="streak-loading-spinner"></div>
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  // Calculate next milestone
  const nextMilestone = streakData.milestones
    .filter(m => !m.isUnlocked)
    .sort((a, b) => a.streak - b.streak)[0];
    
  // Get latest unlocked milestone (most recent one)
  const latestUnlockedMilestone = streakData.milestones
    .filter(m => m.isUnlocked)
    .sort((a, b) => b.streak - a.streak)[0];

  return (
    <div className="streak-milestones-container">
      {/* Celebration Modal */}
      <CelebrationModal
        show={celebration.show}
        emoji={celebration.emoji}
        title={celebration.title}
        message={celebration.message}
        onClose={() => setCelebration({ show: false, emoji: "", title: "", message: "" })}
      />
      {/* Streak Stats Card */}
      <div className="streak-stats-card">
        {/* Latest Unlocked Animal Badge */}
        {latestUnlockedMilestone && (
          <div className="latest-animal-badge" title={`${latestUnlockedMilestone.name} - ${latestUnlockedMilestone.streak} ${t("streak.days")}`}>
            <span className="animal-badge-emoji">{latestUnlockedMilestone.emoji}</span>
            <span className="animal-badge-streak">{latestUnlockedMilestone.streak}</span>
          </div>
        )}
        
        <div className="streak-header">
          <div className="streak-icon">🔥</div>
          <div className="streak-info">
            <h2 className="streak-title">{t("streak.title")}</h2>
            <p className="streak-subtitle">{t("streak.subtitle")}</p>
          </div>
        </div>

        <div className="streak-numbers">
          <div className="streak-stat">
            <div className="streak-stat-value">{streakData.currentStreak}</div>
            <div className="streak-stat-label">{t("streak.current")}</div>
          </div>
          <div className="streak-divider"></div>
          <div className="streak-stat">
            <div className="streak-stat-value">{streakData.longestStreak}</div>
            <div className="streak-stat-label">{t("streak.longest")}</div>
          </div>
        </div>

        <div className="streak-actions">
          <button 
            className="streak-rewards-button"
            onClick={handleRewardsCardClick}
            title={t("streak.viewAllRewards")}
          >
            <span className="rewards-gift-icon">🎁</span>
            <span className="rewards-button-text">
              <span className="rewards-count">
                {streakData.milestones.filter(m => m.isUnlocked).length}/{streakData.milestones.length}
              </span>
              <span className="rewards-label">{t("streak.rewards")}</span>
            </span>
          </button>
        </div>

        {/* Next milestone preview */}
        {nextMilestone && (
          <div className="next-milestone-preview">
            <div className="next-milestone-info">
              <span className="next-milestone-emoji">{nextMilestone.emoji}</span>
              <span className="next-milestone-text">
                {t("streak.keepGoing")} <strong>{nextMilestone.daysToGo}</strong> {t("streak.moreDays")}
              </span>
            </div>
            <div className="next-milestone-progress">
              <div 
                className="next-milestone-progress-bar" 
                style={{ width: `${nextMilestone.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Makeup Modal */}
      {showMakeupModal && (
        <div className="milestone-modal-overlay" onClick={closeMakeupModal}>
          <div
            className="makeup-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="milestone-modal-close" onClick={closeMakeupModal}>
              ×
            </button>

            <div className="makeup-modal-header">
              <div className="makeup-modal-icon">📝</div>
              <h2 className="makeup-modal-title">{t("streak.makeupTitle")}</h2>
              <p className="makeup-modal-subtitle">
                {t("streak.makeupRemaining")}: {streakData.makeupCheckIns.remainingMakeups}/
                {streakData.makeupCheckIns.monthlyLimit}
              </p>
            </div>

            <div className="makeup-form">
              <div className="makeup-form-group">
                <label className="makeup-form-label">{t("streak.selectDate")}</label>
                <input
                  type="date"
                  className="makeup-date-input"
                  value={makeupDate}
                  onChange={(e) => setMakeupDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="makeup-form-group">
                <label className="makeup-form-label">{t("mood.selectMood")}</label>
                <div className="makeup-mood-selector">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      className={`makeup-mood-option ${makeupMoodData.mood === mood.value ? 'selected' : ''}`}
                      onClick={() => setMakeupMoodData({ ...makeupMoodData, mood: mood.value })}
                    >
                      <img src={mood.image} alt={mood.label} className="makeup-mood-image" />
                      <span className="makeup-mood-label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="makeup-form-group">
                <label className="makeup-form-label">{t("mood.energyLevel")}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="makeup-energy-slider"
                  value={makeupMoodData.energyLevel}
                  onChange={(e) => setMakeupMoodData({ 
                    ...makeupMoodData, 
                    energyLevel: parseInt(e.target.value) 
                  })}
                />
                <div className="makeup-energy-value">{makeupMoodData.energyLevel}/10</div>
              </div>

              <div className="makeup-form-group">
                <label className="makeup-form-label">{t("mood.note")}</label>
                <textarea
                  className="makeup-note-textarea"
                  placeholder={t("mood.notePlaceholder")}
                  value={makeupMoodData.note}
                  onChange={(e) => setMakeupMoodData({ 
                    ...makeupMoodData, 
                    note: e.target.value 
                  })}
                  maxLength={500}
                />
              </div>

              <div className="makeup-form-actions">
                <button className="makeup-cancel-button" onClick={closeMakeupModal}>
                  {t("common.cancel")}
                </button>
                <button className="makeup-submit-button" onClick={handleMakeupSubmit}>
                  {t("streak.submitMakeup")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Milestones Modal */}
      {showAllMilestones && (
        <div className="milestone-modal-overlay" onClick={closeAllMilestonesModal}>
          <div
            className="all-milestones-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="milestone-modal-close" onClick={closeAllMilestonesModal}>
              ×
            </button>

            <h2 className="all-milestones-modal-title">{t("streak.allRewards")}</h2>
            <p className="all-milestones-modal-subtitle">{t("streak.rewardsDesc")}</p>

            <div className="all-milestones-grid">
              {streakData.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`milestone-card ${
                    milestone.isUnlocked ? "unlocked" : "locked"
                  }`}
                  onClick={() => {
                    setShowAllMilestones(false);
                    handleMilestoneClick(milestone);
                  }}
                >
                  <div className="milestone-animal-container">
                    <div className="milestone-animal-emoji">{milestone.emoji}</div>
                    {!milestone.isUnlocked && (
                      <div className="milestone-lock-overlay">
                        <span className="lock-icon">🔒</span>
                      </div>
                    )}
                    {milestone.isUnlocked && (
                      <div className="milestone-unlocked-badge">✓</div>
                    )}
                  </div>

                  <div className="milestone-info">
                    <div className="milestone-name">{milestone.name}</div>
                    <div className="milestone-requirement">
                      {milestone.streak} {t("streak.days")}
                    </div>
                  </div>

                  {!milestone.isUnlocked && (
                    <div className="milestone-progress-bar">
                      <div
                        className="milestone-progress-fill"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  )}

                  {milestone.isUnlocked && milestone.unlockedAt && (
                    <div className="milestone-unlocked-date">
                      {new Date(milestone.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Milestone Detail Modal */}
      {showMilestoneModal && selectedMilestone && (
        <div className="milestone-modal-overlay" onClick={closeMilestoneModal}>
          <div
            className="milestone-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="milestone-modal-close" onClick={closeMilestoneModal}>
              ×
            </button>

            <div className="milestone-modal-animal">
              <div className="milestone-modal-emoji">
                {selectedMilestone.emoji}
              </div>
              {selectedMilestone.isUnlocked && (
                <div className="milestone-modal-unlocked-badge">
                  ✨ {t("streak.unlocked")}
                </div>
              )}
            </div>

            <h2 className="milestone-modal-title">{selectedMilestone.name}</h2>

            <div className="milestone-modal-requirement">
              <span className="requirement-icon">🎯</span>
              <span>
                {t("streak.requirement")}: {selectedMilestone.streak}{" "}
                {t("streak.consecutiveDays")}
              </span>
            </div>

            {selectedMilestone.isUnlocked ? (
              <div className="milestone-modal-unlocked-info">
                <div className="unlocked-info-item">
                  <span className="unlocked-info-icon">🎉</span>
                  <div>
                    <div className="unlocked-info-label">
                      {t("streak.unlockedOn")}
                    </div>
                    <div className="unlocked-info-value">
                      {new Date(
                        selectedMilestone.unlockedAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="milestone-modal-message">
                  {t("streak.congratsMessage")}
                </p>
              </div>
            ) : (
              <div className="milestone-modal-locked-info">
                <div className="locked-progress-container">
                  <div className="locked-progress-bar">
                    <div
                      className="locked-progress-fill"
                      style={{ width: `${selectedMilestone.progress}%` }}
                    ></div>
                  </div>
                  <div className="locked-progress-text">
                    {streakData.currentStreak} / {selectedMilestone.streak}{" "}
                    {t("streak.days")}
                  </div>
                </div>
                <p className="milestone-modal-message">
                  {t("streak.keepGoing")} {" "}
                  {selectedMilestone.streak - streakData.currentStreak}{" "}
                  {t("streak.moreDays")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="milestone-modal-overlay" onClick={() => setShowSuccessPopup(false)}>
          <div className="success-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-popup-icon">✅</div>
            <h2 className="success-popup-title">{t("common.success")}</h2>
            <p className="success-popup-message">{successMessage}</p>
            <button 
              className="success-popup-button" 
              onClick={() => setShowSuccessPopup(false)}
            >
              {t("common.ok")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakMilestones;
