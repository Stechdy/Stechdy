import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import CelebrationModal from "../../components/common/CelebrationModal";
import moodService from "../../services/moodService";
import "./Mood.css";

// Import mood images
import upsetImg from "../../assets/Upset.png";
import sadImg from "../../assets/Sad.png";
import normalImg from "../../assets/Normal.png";
import happyImg from "../../assets/Happy.png";
import veryHappyImg from "../../assets/Veryhappy.png";

const Mood = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [energyLevel, setEnergyLevel] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [iconAnimate, setIconAnimate] = useState(false);
  const [celebration, setCelebration] = useState({
    show: false,
    emoji: "",
    title: "",
    message: "",
  });

  // Mood options
  const moods = [
    { value: 1, image: upsetImg, label: t("mood.moods.upset") },
    { value: 2, image: sadImg, label: t("mood.moods.sad") },
    { value: 3, image: normalImg, label: t("mood.moods.normal") },
    { value: 4, image: happyImg, label: t("mood.moods.happy") },
    { value: 5, image: veryHappyImg, label: t("mood.moods.veryHappy") },
  ];

  // Energy icons based on level with better visuals
  const getEnergyIcon = (level) => {
    if (level <= 2) return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="energy-svg">
        <circle cx="24" cy="24" r="20" fill="url(#lowEnergy)" opacity="0.2"/>
        <path d="M24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 15.2 32.8 8 24 8ZM24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C30.6 12 36 17.4 36 24C36 30.6 30.6 36 24 36Z" fill="#DC2626"/>
        <circle cx="24" cy="24" r="6" fill="#DC2626"/>
        <defs>
          <linearGradient id="lowEnergy" x1="24" y1="4" x2="24" y2="44">
            <stop stopColor="#DC2626"/>
            <stop offset="1" stopColor="#991B1B"/>
          </linearGradient>
        </defs>
      </svg>
    ); // Very low - Red battery icon
    
    if (level <= 4) return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="energy-svg">
        <rect x="10" y="18" width="24" height="16" rx="2" fill="#F59E0B" opacity="0.2"/>
        <rect x="34" y="22" width="4" height="8" rx="1" fill="#F59E0B"/>
        <rect x="12" y="20" width="8" height="12" rx="1" fill="#F59E0B"/>
        <path d="M24 14L20 24H24L22 34L30 22H26L28 14H24Z" fill="#F59E0B" opacity="0.5"/>
      </svg>
    ); // Low - Orange battery with small charge
    
    if (level <= 6) return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="energy-svg">
        <rect x="10" y="18" width="24" height="16" rx="2" fill="#FBBF24" opacity="0.2"/>
        <rect x="34" y="22" width="4" height="8" rx="1" fill="#FBBF24"/>
        <rect x="12" y="20" width="14" height="12" rx="1" fill="#FBBF24"/>
        <circle cx="24" cy="24" r="3" fill="#FBBF24"/>
        <circle cx="24" cy="24" r="6" fill="#FBBF24" opacity="0.3"/>
      </svg>
    ); // Medium - Yellow battery half full
    
    if (level <= 8) return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="energy-svg">
        <rect x="10" y="18" width="24" height="16" rx="2" fill="#10B981" opacity="0.2"/>
        <rect x="34" y="22" width="4" height="8" rx="1" fill="#10B981"/>
        <rect x="12" y="20" width="20" height="12" rx="1" fill="url(#highEnergy)"/>
        <path d="M24 14L20 24H24L22 34L30 22H26L28 14H24Z" fill="#FBBF24" transform="translate(0, 2)"/>
        <defs>
          <linearGradient id="highEnergy" x1="12" y1="20" x2="32" y2="32">
            <stop stopColor="#10B981"/>
            <stop offset="1" stopColor="#059669"/>
          </linearGradient>
        </defs>
      </svg>
    ); // High - Green battery almost full with lightning
    
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="energy-svg">
        <circle cx="24" cy="24" r="20" fill="url(#veryHighEnergy)" opacity="0.2"/>
        <circle cx="24" cy="24" r="16" fill="url(#veryHighGradient)"/>
        <path d="M24 8L26 18L34 14L28 24L36 26L26 32L28 40L18 34L14 40L18 28L8 26L18 20L14 14L24 8Z" fill="url(#sparkle)"/>
        <circle cx="24" cy="24" r="8" fill="#FCD34D"/>
        <circle cx="24" cy="24" r="4" fill="#FBBF24"/>
        <defs>
          <linearGradient id="veryHighEnergy" x1="24" y1="4" x2="24" y2="44">
            <stop stopColor="#FBBF24"/>
            <stop offset="1" stopColor="#F59E0B"/>
          </linearGradient>
          <linearGradient id="veryHighGradient" x1="24" y1="8" x2="24" y2="40">
            <stop stopColor="#FCD34D"/>
            <stop offset="1" stopColor="#FBBF24"/>
          </linearGradient>
          <linearGradient id="sparkle" x1="24" y1="8" x2="24" y2="40">
            <stop stopColor="#FEF3C7"/>
            <stop offset="1" stopColor="#FCD34D"/>
          </linearGradient>
        </defs>
      </svg>
    ); // Very high - Golden sparkle/star
  };

  // Get energy description based on level
  const getEnergyDescription = (level) => {
    if (level <= 2) return t("mood.energyDescriptions.veryLow") || "Exhausted";
    if (level <= 4) return t("mood.energyDescriptions.low") || "Tired";
    if (level <= 6) return t("mood.energyDescriptions.medium") || "Okay";
    if (level <= 8) return t("mood.energyDescriptions.high") || "Energized";
    return t("mood.energyDescriptions.veryHigh") || "Supercharged";
  };

  useEffect(() => {
    loadTodayMood();
  }, []);

  const loadTodayMood = async () => {
    try {
      const response = await moodService.getTodayMood();
      if (response.success && response.data) {
        setTodayMood(response.data);
        setSelectedMood(response.data.mood);
        setNote(response.data.note || "");
        setEnergyLevel(response.data.energyLevel || 5);
      }
    } catch (error) {
      console.error("Error loading today mood:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      alert(t("mood.selectMood"));
      return;
    }

    setLoading(true);
    try {
      const response = await moodService.createMoodEntry({
        mood: selectedMood,
        note: note.trim(),
        energyLevel: energyLevel,
      });

      if (response.success) {
        // Emit event to update streak in real-time across components
        if (response.data?.currentStreak !== undefined && response.data?.longestStreak !== undefined) {
          window.dispatchEvent(new CustomEvent('streakUpdated', {
            detail: {
              currentStreak: response.data.currentStreak,
              longestStreak: response.data.longestStreak
            }
          }));
        }

        // Check for milestones and show celebration
        const hasNewBadge = response.data?.newBadge;
        const hasNewMilestones = response.data?.newMilestones && response.data.newMilestones.length > 0;
        const currentStreak = response.data?.currentStreak;

        if (hasNewBadge || hasNewMilestones || (currentStreak && currentStreak % 7 === 0 && currentStreak >= 7)) {
          // Determine celebration content
          let celebrationEmoji = "🎉";
          let celebrationTitle = t("celebration.congratulations");
          let celebrationMessage = "";

          if (hasNewBadge) {
            celebrationEmoji = "🏆";
            celebrationTitle = t("celebration.newBadge");
            celebrationMessage = t("celebration.badgeEarned", { badge: response.data.newBadge });
          } else if (hasNewMilestones) {
            const milestone = response.data.newMilestones[0];
            celebrationEmoji = milestone.emoji || "🎖️";
            celebrationTitle = milestone.name || t("celebration.newMilestone");
            celebrationMessage = milestone.description || t("celebration.streakAchieved", { days: currentStreak });
          } else if (currentStreak % 7 === 0) {
            celebrationEmoji = "🔥";
            celebrationTitle = t("celebration.streakMilestone", { days: currentStreak });
            celebrationMessage = t("celebration.keepGoing");
          }

          // Show celebration
          setCelebration({
            show: true,
            emoji: celebrationEmoji,
            title: celebrationTitle,
            message: celebrationMessage,
          });

          // Close celebration and navigate after 6.5 seconds
          setTimeout(() => {
            setCelebration({ show: false, emoji: "", title: "", message: "" });
            navigate("/mood/history");
          }, 6500);
        } else {
          // No milestone, show success toast and navigate
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate("/mood/history");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error saving mood:", error);
      alert(t("mood.errorSaving"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mood-page-container">
      <SidebarNav />
      <div className="mood-page">
        {/* Celebration Modal */}
        <CelebrationModal
          show={celebration.show}
          emoji={celebration.emoji}
          title={celebration.title}
          message={celebration.message}
          onClose={() => setCelebration({ show: false, emoji: "", title: "", message: "" })}
        />

        {/* Success notification */}
        {showSuccess && (
          <div className="success-toast">{t("mood.savedSuccess")}</div>
        )}

        <header className="mood-header">
          <h1 className="mood-title">{t("mood.title")}</h1>
          <button
            className="history-btn"
            onClick={() => navigate("/mood/history")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.25 15.52L17.02 14.24L13.5 12.15V8H12Z"
                fill="#5ECFB1"
              />
            </svg>
          </button>
        </header>

        <div className="mood-content">
          <p className="mood-question">{t("mood.howAreYou")}</p>

          {/* Mood Selector */}
          <div className="mood-selector">
            {moods.map((mood) => (
              <button
                key={mood.value}
                className={`mood-option ${
                  selectedMood === mood.value ? "selected" : ""
                }`}
                onClick={() => setSelectedMood(mood.value)}
              >
                <img src={mood.image} alt={mood.label} className="mood-image" />
                <span className="mood-label">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Note Section */}
          <div className="note-section">
            <label className="section-label">{t("mood.notes")}</label>
            <textarea
              className="note-input"
              placeholder={t("mood.notesPlaceholder")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              maxLength={500}
            />
            <div className="char-count">{note.length}/500</div>
          </div>

          {/* Energy Level Slider */}
          <div className="energy-section">
            <div className="section-header">
              <label className="section-label">{t("mood.energyLevel")}</label>
              <span className="energy-value">{energyLevel}/10</span>
            </div>
            <div className="energy-slider-container">
              <div className="slider-wrapper">
                <span className="slider-label">{t("mood.low")}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => {
                    setEnergyLevel(parseInt(e.target.value));
                    setIconAnimate(true);
                    setTimeout(() => setIconAnimate(false), 500);
                  }}
                  className="energy-slider"
                />
                <span className="slider-label">{t("mood.high")}</span>
              </div>
              <div className="energy-display">
                <div className={`energy-icon ${iconAnimate ? "animate" : ""}`}>
                  {getEnergyIcon(energyLevel)}
                </div>
                <p className="energy-description">
                  {getEnergyDescription(energyLevel)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!selectedMood || loading}
          >
            {loading ? t("mood.saving") : t("mood.saveButton")}
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Mood;
