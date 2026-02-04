import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import moodService from "../../services/moodService";
import CelebrationModal from "../common/CelebrationModal";
import "./MoodCalendar.css";

// Import mood images
import upsetImg from "../../assets/Upset.png";
import sadImg from "../../assets/Sad.png";
import normalImg from "../../assets/Normal.png";
import happyImg from "../../assets/Happy.png";
import veryHappyImg from "../../assets/Veryhappy.png";

// UTC Date Helper Functions - ensure consistent date handling across the app
const dateUtils = {
  // Get start of day in UTC
  getStartOfDayUTC: (year, month, day) => {
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  },
  
  // Get end of day in UTC
  getEndOfDayUTC: (year, month, day) => {
    return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  },
  
  // Get first day of month in UTC
  getStartOfMonthUTC: (year, month) => {
    return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  },
  
  // Get last day of month in UTC (handles 28, 29, 30, 31 days automatically)
  getEndOfMonthUTC: (year, month) => {
    // Setting day to 0 of next month gives us the last day of current month
    return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  },
  
  // Get number of days in month (handles 28, 29, 30, 31 days)
  getDaysInMonth: (year, month) => {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  },
  
  // Format date as YYYY-MM-DD for API
  formatDateForAPI: (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
};

const MoodCalendar = () => {
  const { t, i18n } = useTranslation();
  const [moods, setMoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("language") || "en"
  );
  
  // Makeup check-in states
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [makeupDate, setMakeupDate] = useState(null);
  const [makeupMoodData, setMakeupMoodData] = useState({
    mood: 3,
    emotionTags: [],
    note: '',
    energyLevel: 5
  });
  const [streakData, setStreakData] = useState(null);
  const [showNoMakeupsModal, setShowNoMakeupsModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [celebration, setCelebration] = useState({
    show: false,
    emoji: "",
    title: "",
    message: "",
  });

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

  const getMoodImage = (moodValue) => {
    const moodImages = {
      1: upsetImg,
      2: sadImg,
      3: normalImg,
      4: happyImg,
      5: veryHappyImg,
    };
    return moodImages[moodValue];
  };

  const moodLabelKeys = {
    1: "moodCalendar.moods.upset",
    2: "moodCalendar.moods.sad",
    3: "moodCalendar.moods.normal",
    4: "moodCalendar.moods.happy",
    5: "moodCalendar.moods.veryHappy",
  };

  useEffect(() => {
    loadMonthMoods();
    loadStreakData();
  }, [currentMonth]);
  
  const loadStreakData = async () => {
    try {
      const response = await moodService.getStreakInfo();
      if (response.success) {
        setStreakData(response.data);
      }
    } catch (error) {
    }
  };

  const loadMonthMoods = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Use utility functions to get month boundaries in UTC
      const startOfMonth = dateUtils.getStartOfMonthUTC(year, month);
      const endOfMonth = dateUtils.getEndOfMonthUTC(year, month);
      const daysInMonth = dateUtils.getDaysInMonth(year, month);

      const response = await moodService.getMoodEntries({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        limit: 100,
      });

      if (response.success) {
        setMoods(response.data);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Use utility to get days in month (handles 28, 29, 30, 31 automatically)
    const daysInMonth = dateUtils.getDaysInMonth(year, month);
    
    // Get first day of month to determine starting position
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days (1 to 28/29/30/31 depending on the month)
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getMoodForDate = (day) => {
    if (!day) return null;
    return moods.find(mood => {
      // Parse mood date as UTC and compare UTC date components
      const moodDate = new Date(mood.date);
      const moodYear = moodDate.getUTCFullYear();
      const moodMonth = moodDate.getUTCMonth();
      const moodDay = moodDate.getUTCDate();
      
      // Compare with target date (currentMonth and day)
      return moodYear === currentMonth.getFullYear() &&
             moodMonth === currentMonth.getMonth() &&
             moodDay === day;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const mood = getMoodForDate(day);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Create UTC date for clicked day
    const clickedDate = dateUtils.getStartOfDayUTC(year, month, day);
    
    // Get today in UTC
    const now = new Date();
    const today = dateUtils.getStartOfDayUTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    
    // If mood exists, show detail modal
    if (mood) {
      setSelectedDate(day);
      setSelectedMood(mood);
    } 
    // If no mood and date is in the past, allow makeup check-in
    else if (clickedDate < today) {
      // Check if user has makeup check-ins remaining
      if (streakData && streakData.makeupCheckIns.remainingMakeups > 0) {
        setMakeupDate(clickedDate);
        setShowMakeupModal(true);
      } else {
        // Show modal instead of alert
        setShowNoMakeupsModal(true);
      }
    }
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedMood(null);
  };
  
  const closeMakeupModal = () => {
    setShowMakeupModal(false);
    setMakeupDate(null);
    setMakeupMoodData({
      mood: 3,
      emotionTags: [],
      note: '',
      energyLevel: 5
    });
  };
  
  const handleMakeupSubmit = async () => {
    if (!makeupDate) {
      setSuccessMessage(t("streak.selectDateFirst") || "Vui lòng chọn ngày");
      setShowSuccessPopup(true);
      return;
    }

    try {
      // Format date as YYYY-MM-DD using utility function
      const year = makeupDate.getUTCFullYear();
      const month = makeupDate.getUTCMonth();
      const day = makeupDate.getUTCDate();
      const dateString = dateUtils.formatDateForAPI(year, month, day);
      
      const response = await moodService.makeupMoodCheckIn({
        date: dateString,
        ...makeupMoodData
      });

      if (response.success) {
        // Close modal first
        closeMakeupModal();
        
        // Reload data
        loadMonthMoods();
        loadStreakData();
        
        // Emit event to notify other components (like StreakMilestones) to reload
        window.dispatchEvent(new CustomEvent('streakUpdated', { 
          detail: { 
            currentStreak: response.data.currentStreak,
            longestStreak: response.data.longestStreak 
          }
        }));
        
        // Check for milestones and show celebration
        const hasNewMilestones = response.data?.newMilestones && response.data.newMilestones.length > 0;
        const currentStreak = response.data?.currentStreak;

        if (hasNewMilestones) {
          // Determine celebration content
          const milestone = response.data.newMilestones[0];
          const celebrationEmoji = milestone.emoji || "🎖️";
          
          // Use translation keys based on animalId instead of backend text
          const animalId = milestone.animalId || 'bunny';
          const celebrationTitle = t(`celebration.milestones.${animalId}.name`) || milestone.name || t("celebration.newMilestone");
          const celebrationMessage = t(`celebration.milestones.${animalId}.description`) || milestone.description || t("celebration.streakAchieved", { days: currentStreak });

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
        } else {
          // No milestone, show success popup
          const remainingMakeups = response.data?.remainingMakeups || 0;
          setSuccessMessage(t("streak.makeupSuccessMessage", { remaining: remainingMakeups }));
          setShowSuccessPopup(true);
        }
      }
    } catch (error) {
      // Close modal first
      closeMakeupModal();
      
      // Then show error popup
      setSuccessMessage(t("streak.makeupError"));
      setShowSuccessPopup(true);
    }
  };
  
  // Mood options with images (same as Mood page)
  const moodOptions = [
    { value: 1, image: upsetImg, label: t("mood.moods.upset") || "Buồn" },
    { value: 2, image: sadImg, label: t("mood.moods.sad") || "Hơi buồn" },
    { value: 3, image: normalImg, label: t("mood.moods.normal") || "Bình thường" },
    { value: 4, image: happyImg, label: t("mood.moods.happy") || "Vui" },
    { value: 5, image: veryHappyImg, label: t("mood.moods.veryHappy") || "Rất vui" },
  ];

  const monthNameKeys = [
    "moodCalendar.months.january",
    "moodCalendar.months.february",
    "moodCalendar.months.march",
    "moodCalendar.months.april",
    "moodCalendar.months.may",
    "moodCalendar.months.june",
    "moodCalendar.months.july",
    "moodCalendar.months.august",
    "moodCalendar.months.september",
    "moodCalendar.months.october",
    "moodCalendar.months.november",
    "moodCalendar.months.december",
  ];

  const weekDayKeys = [
    "moodCalendar.weekDays.sun",
    "moodCalendar.weekDays.mon",
    "moodCalendar.weekDays.tue",
    "moodCalendar.weekDays.wed",
    "moodCalendar.weekDays.thu",
    "moodCalendar.weekDays.fri",
    "moodCalendar.weekDays.sat",
  ];

  return (
    <div className="mood-calendar">
      {/* Celebration Modal - Render to body for full screen */}
      {ReactDOM.createPortal(
        <CelebrationModal
          show={celebration.show}
          emoji={celebration.emoji}
          title={celebration.title}
          message={celebration.message}
          onClose={() => setCelebration({ show: false, emoji: "", title: "", message: "" })}
        />,
        document.body
      )}
      
      {/* Makeup Check-in Instruction */}
      {streakData && streakData.makeupCheckIns.remainingMakeups > 0 && (
        <div className="makeup-instruction">
          <div className="makeup-arrow">↓</div>
          <p className="makeup-note">
            💡 {t("moodCalendar.makeupNote") || "Bấm vào ngày bạn muốn điểm danh bù"}
            {" "}({streakData.makeupCheckIns.remainingMakeups}/{streakData.makeupCheckIns.monthlyLimit} {t("streak.remainingTurns") || "lượt còn lại"})
          </p>
        </div>
      )}
      
      {streakData && streakData.makeupCheckIns.remainingMakeups === 0 && (
        <div className="makeup-instruction no-makeups">
          <p className="makeup-note-error">
            ⚠️ {t("streak.noMakeupsRemaining") || "Bạn đã hết lượt điểm danh bù trong tháng này"}
          </p>
        </div>
      )}
      
      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={previousMonth}>
          ←
        </button>
        <h2 className="calendar-title">
          {t(monthNameKeys[currentMonth.getMonth()])}{" "}
          {currentMonth.getFullYear()}
        </h2>
        <button className="nav-btn" onClick={nextMonth}>
          →
        </button>
      </div>

      {/* Week Days */}
      <div className="calendar-weekdays">
        {weekDayKeys.map((dayKey, index) => (
          <div key={index} className="weekday">
            {t(dayKey)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {getDaysInMonth().map((day, index) => {
          const mood = getMoodForDate(day);
          const isToday =
            day &&
            day === new Date().getDate() &&
            currentMonth.getMonth() === new Date().getMonth() &&
            currentMonth.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`calendar-day ${!day ? "empty" : ""} ${
                isToday ? "today" : ""
              } ${mood ? "has-mood" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <span className="day-number">{day}</span>
                  {mood && (
                    <span className="day-mood">
                      <img src={getMoodImage(mood.mood)} alt={t(moodLabelKeys[mood.mood])} />
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Mood Detail Modal */}
      {selectedMood && ReactDOM.createPortal(
        <div className="mood-modal-overlay" onClick={closeModal}>
          <div className="mood-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedDate} {t(monthNameKeys[currentMonth.getMonth()])}
              </h3>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-mood">
                <span className="modal-emoji">
                  <img src={getMoodImage(selectedMood.mood)} alt={t(moodLabelKeys[selectedMood.mood])} />
                </span>
                <span className="modal-label">
                  {t(moodLabelKeys[selectedMood.mood])}
                </span>
              </div>

              {selectedMood.energyLevel && (
                <div className="modal-energy">
                  <span className="modal-field-label">
                    ⚡ {t("moodCalendar.energy")}
                  </span>
                  <span className="modal-field-value">
                    {selectedMood.energyLevel}/10
                  </span>
                </div>
              )}

              {selectedMood.emotionTags &&
                selectedMood.emotionTags.length > 0 && (
                  <div className="modal-emotions">
                    <span className="modal-field-label">
                      🏷️ {t("moodCalendar.emotions")}
                    </span>
                    <div className="modal-emotion-tags">
                      {selectedMood.emotionTags.map((tag, idx) => (
                        <span key={idx} className="modal-emotion-tag">
                          {translateEmotion(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedMood.note && (
                <div className="modal-note">
                  <span className="modal-field-label">
                    📝 {t("moodCalendar.notes")}
                  </span>
                  <p>{selectedMood.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Makeup Check-in Modal */}
      {showMakeupModal && makeupDate && ReactDOM.createPortal(
        <div className="mood-modal-overlay" onClick={closeMakeupModal}>
          <div className="mood-modal makeup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                 {t("streak.makeupCheckIn") || "Điểm danh bù"}
              </h3>
              <button className="close-btn" onClick={closeMakeupModal}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <p className="makeup-date-info">
                {t("moodCalendar.makeupFor") || "Điểm danh bù cho ngày"}: <strong>
                  {makeupDate.getDate()} {t(monthNameKeys[makeupDate.getMonth()])} {makeupDate.getFullYear()}
                </strong>
              </p>
              
              {/* Mood Selector */}
              <div className="makeup-mood-selector">
                <label>{t("mood.selectMood") || "Chọn tâm trạng"}:</label>
                <div className="mood-options">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      className={`mood-option ${makeupMoodData.mood === mood.value ? 'selected' : ''}`}
                      onClick={() => setMakeupMoodData({...makeupMoodData, mood: mood.value})}
                    >
                      <img src={mood.image} alt={mood.label} className="mood-image" />
                      <span className="mood-label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Energy Level */}
              <div className="makeup-energy-selector">
                <label>
                  ⚡ {t("mood.energyLevel") || "Mức năng lượng"}: {makeupMoodData.energyLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={makeupMoodData.energyLevel}
                  onChange={(e) => setMakeupMoodData({...makeupMoodData, energyLevel: parseInt(e.target.value)})}
                  className="energy-slider"
                />
              </div>
              
              {/* Note */}
              <div className="makeup-note-input">
                <label>📝 {t("mood.note") || "Ghi chú"} ({t("common.optional") || "tùy chọn"}):</label>
                <textarea
                  value={makeupMoodData.note}
                  onChange={(e) => setMakeupMoodData({...makeupMoodData, note: e.target.value})}
                  placeholder={t("mood.notePlaceholder") || "Viết ghi chú..."}
                  maxLength={500}
                  rows={3}
                />
              </div>
              
              {/* Submit Button */}
              <button className="makeup-submit-btn" onClick={handleMakeupSubmit}>
                 {t("streak.confirmMakeup") || "Xác nhận điểm danh bù"}
              </button>
              
              <p className="makeup-remaining-info">
                {t("streak.remainingAfter") || "Sau khi điểm danh này, bạn còn"}{" "}
                <strong>{streakData.makeupCheckIns.remainingMakeups - 1}</strong>{" "}
                {t("streak.remainingTurns") || "lượt"} {t("streak.thisMonth") || "trong tháng này"}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {/* No Makeups Remaining Modal */}
      {showNoMakeupsModal && ReactDOM.createPortal(
        <div className="mood-modal-overlay" onClick={() => setShowNoMakeupsModal(false)}>
          <div className="mood-modal no-makeups-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                 {t("streak.noMakeupsTitle") || "Hết lượt điểm danh bù"}
              </h3>
              <button className="close-btn" onClick={() => setShowNoMakeupsModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="no-makeups-icon">
                🌟
              </div>
              <p className="no-makeups-message">
                {t("streak.noMakeupsDesc") || "Bạn đã sử dụng hết 3 lượt điểm danh bù trong tháng này. Lượt điểm danh bù sẽ được làm mới vào đầu tháng sau."}
              </p>
              
              <div className="no-makeups-stats">
                <div className="stat-item">
                  <span className="stat-label">{t("streak.makeupUsed") || "Đã sử dụng"}:</span>
                  <span className="stat-value">{streakData?.makeupCheckIns.usedThisMonth || 3}/3</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t("streak.makeupRemaining") || "Còn lại"}:</span>
                  <span className="stat-value highlight">0/{streakData?.makeupCheckIns.monthlyLimit || 3}</span>
                </div>
              </div>
              
              <button className="no-makeups-ok-btn" onClick={() => setShowNoMakeupsModal(false)}>
                {t("common.understood") || "Đã hiểu"} ✨
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Popup */}
      {showSuccessPopup && ReactDOM.createPortal(
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default MoodCalendar;
