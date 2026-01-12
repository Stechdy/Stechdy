import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import moodService from "../../services/moodService";
import "./MoodCalendar.css";

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

  const moodEmojis = {
    1: "😢",
    2: "😔",
    3: "😐",
    4: "😊",
    5: "😄",
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
  }, [currentMonth]);

  const loadMonthMoods = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
        0, 0, 0, 0
      );
      const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
        23, 59, 59, 999
      );

      console.log('MoodCalendar - loadMonthMoods');
      console.log('MoodCalendar - currentMonth:', currentMonth);
      console.log('MoodCalendar - startOfMonth:', startOfMonth.toISOString());
      console.log('MoodCalendar - endOfMonth:', endOfMonth.toISOString());

      const response = await moodService.getMoodEntries({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        limit: 100,
      });

      console.log('Calendar mood entries response:', response);
      if (response.success) {
        console.log('Calendar moods data count:', response.data?.length);
        console.log('Calendar moods data:', response.data);
        setMoods(response.data);
      } else {
        console.warn('Calendar response not successful:', response);
      }
    } catch (error) {
      console.error("Error loading moods:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getMoodForDate = (day) => {
    if (!day) return null;
    return moods.find(mood => {
      // Parse mood date from backend and extract just the date part
      const moodDate = new Date(mood.date);
      
      // Extract date components directly from the date string to avoid timezone issues
      // If mood.date is "2024-12-25T00:00:00.000Z" or similar, extract the date part
      const dateStr = mood.date.split('T')[0]; // Get "2024-12-25"
      const [year, month, dayOfMonth] = dateStr.split('-').map(Number);
      
      // Compare with target date
      return year === currentMonth.getFullYear() &&
             month === currentMonth.getMonth() + 1 && // month is 1-indexed in date string
             dayOfMonth === day;
    });
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const mood = getMoodForDate(day);
    if (mood) {
      setSelectedDate(day);
      setSelectedMood(mood);
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
                    <span className="day-mood">{moodEmojis[mood.mood]}</span>
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
                  {moodEmojis[selectedMood.mood]}
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
    </div>
  );
};

export default MoodCalendar;
