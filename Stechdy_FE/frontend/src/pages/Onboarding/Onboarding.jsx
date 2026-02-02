import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import "./Onboarding.css";

// Import images from assets - using require for better deployment compatibility
import Happy from "../../assets/Happy.png";
import Normal from "../../assets/Normal.png";
import Veryhappy from "../../assets/Veryhappy.png";
import ideaIcon from "../../assets/idea.png";

// ========================================
// 📸 THAY ĐỔI LINK ẢNH TẠI ĐÂY
// Các ảnh này dùng cho phần giới thiệu tính năng
// ========================================
const FEATURE_IMAGES = {
  dashboard: ideaIcon,       // Trang chủ thông minh
  timer: Veryhappy,          // Pomodoro Timer
  calendar: Happy,           // Lịch học thông minh
  mood: Veryhappy,           // Theo dõi tâm trạng
  ai: ideaIcon,              // Trợ lý AI thông minh
};
// ========================================

const Onboarding = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    studyGoal: "",
    studyHours: "",
    challenges: [],
    preferredTime: "",
    motivation: "",
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const currentLanguage = i18n.language || "vi";

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Welcome + Feature slides + Interview questions
  const slides = [
    // Welcome slide
    {
      type: "welcome",
      emoji: "🎉",
      title: t("onboarding.welcome.title") || "Chào mừng đến với Stechdy!",
      subtitle: t("onboarding.welcome.subtitle") || "Hành trình học tập tuyệt vời của bạn bắt đầu từ đây",
      description: t("onboarding.welcome.description") || "Hãy cùng khám phá các tính năng và thiết lập tài khoản của bạn nhé!",
    },
    // Feature: Dashboard
    {
      type: "feature",
      image: FEATURE_IMAGES.dashboard,
      color: "#6366f1",
      title: t("onboarding.features.dashboard.title") || "Trang chủ thông minh",
      description: t("onboarding.features.dashboard.description") || "Xem tổng quan tiến độ học tập, theo dõi streak và nhận gợi ý AI mỗi ngày",
      highlights: [
        t("onboarding.features.dashboard.h1") || "📈 Thống kê học tập trực quan",
        t("onboarding.features.dashboard.h2") || "🔥 Theo dõi streak hàng ngày",
        t("onboarding.features.dashboard.h3") || "🤖 Gợi ý AI thông minh",
      ],
    },
    // Feature: Timer
    {
      type: "feature",
      image: FEATURE_IMAGES.timer,
      color: "#ec4899",
      title: t("onboarding.features.timer.title") || "Pomodoro Timer",
      description: t("onboarding.features.timer.description") || "Tập trung học tập hiệu quả với kỹ thuật Pomodoro và theo dõi thời gian",
      highlights: [
        t("onboarding.features.timer.h1") || "🍅 Phương pháp Pomodoro hiệu quả",
        t("onboarding.features.timer.h2") || "⏰ Tùy chỉnh thời gian linh hoạt",
        t("onboarding.features.timer.h3") || "📝 Ghi chú trong khi học",
      ],
    },
    // Feature: Calendar
    {
      type: "feature",
      image: FEATURE_IMAGES.calendar,
      color: "#10b981",
      title: t("onboarding.features.calendar.title") || "Lịch học thông minh",
      description: t("onboarding.features.calendar.description") || "Lên lịch học tập, quản lý deadline và không bỏ lỡ bất kỳ sự kiện nào",
      highlights: [
        t("onboarding.features.calendar.h1") || "📌 Quản lý deadline hiệu quả",
        t("onboarding.features.calendar.h2") || "🔔 Nhắc nhở thông minh",
        t("onboarding.features.calendar.h3") || "🤖 AI tạo lịch tự động",
      ],
    },
    // Feature: Mood Tracking
    {
      type: "feature",
      image: FEATURE_IMAGES.mood,
      color: "#f59e0b",
      title: t("onboarding.features.mood.title") || "Theo dõi tâm trạng",
      description: t("onboarding.features.mood.description") || "Ghi lại cảm xúc mỗi ngày và hiểu rõ hơn về sức khỏe tinh thần của bạn",
      highlights: [
        t("onboarding.features.mood.h1") || "💭 Nhật ký cảm xúc hàng ngày",
        t("onboarding.features.mood.h2") || "📊 Phân tích xu hướng tâm trạng",
        t("onboarding.features.mood.h3") || "💡 Gợi ý cải thiện tinh thần",
      ],
    },
    // Feature: AI Assistant
    {
      type: "feature",
      image: FEATURE_IMAGES.ai,
      color: "#8b5cf6",
      title: t("onboarding.features.ai.title") || "Trợ lý AI thông minh",
      description: t("onboarding.features.ai.description") || "Chat với AI để được hỗ trợ học tập, giải đáp thắc mắc 24/7",
      highlights: [
        t("onboarding.features.ai.h1") || "💬 Chat AI hỗ trợ học tập",
        t("onboarding.features.ai.h2") || "📚 Tạo lịch học tự động",
        t("onboarding.features.ai.h3") || "🎯 Gợi ý cá nhân hóa",
      ],
    },
    // Interview Question 1: Study Goal
    {
      type: "question",
      questionType: "single",
      icon: "🎯",
      color: "#6366f1",
      title: t("onboarding.questions.goal.title") || "Mục tiêu học tập của bạn là gì?",
      field: "studyGoal",
      options: [
        { value: "exam", label: t("onboarding.questions.goal.exam") || "Chuẩn bị thi cử", emoji: "🎓" },
        { value: "skill", label: t("onboarding.questions.goal.skill") || "Học kỹ năng mới", emoji: "💻" },
        { value: "habit", label: t("onboarding.questions.goal.habit") || "Xây dựng thói quen học", emoji: "📖" },
        { value: "language", label: t("onboarding.questions.goal.language") || "Học ngoại ngữ", emoji: "🌍" },
        { value: "other", label: t("onboarding.questions.goal.other") || "Mục tiêu khác", emoji: "✨" },
      ],
    },
    // Interview Question 2: Study Hours
    {
      type: "question",
      questionType: "single",
      icon: "⏰",
      color: "#ec4899",
      title: t("onboarding.questions.hours.title") || "Bạn muốn học bao nhiêu giờ mỗi ngày?",
      field: "studyHours",
      options: [
        { value: "1", label: t("onboarding.questions.hours.1") || "1-2 giờ (Nhẹ nhàng)", emoji: "😌" },
        { value: "3", label: t("onboarding.questions.hours.3") || "3-4 giờ (Vừa phải)", emoji: "📚" },
        { value: "5", label: t("onboarding.questions.hours.5") || "5-6 giờ (Chăm chỉ)", emoji: "💪" },
        { value: "7", label: t("onboarding.questions.hours.7") || "7+ giờ (Cày cuốc)", emoji: "🔥" },
      ],
    },
    // Interview Question 3: Challenges (Multiple choice)
    {
      type: "question",
      questionType: "multiple",
      icon: "🤔",
      color: "#10b981",
      title: t("onboarding.questions.challenges.title") || "Bạn gặp khó khăn gì khi học?",
      subtitle: t("onboarding.questions.challenges.subtitle") || "(Có thể chọn nhiều)",
      field: "challenges",
      options: [
        { value: "focus", label: t("onboarding.questions.challenges.focus") || "Khó tập trung", emoji: "😵" },
        { value: "time", label: t("onboarding.questions.challenges.time") || "Thiếu thời gian", emoji: "⏳" },
        { value: "motivation", label: t("onboarding.questions.challenges.motivation") || "Thiếu động lực", emoji: "😴" },
        { value: "plan", label: t("onboarding.questions.challenges.plan") || "Không biết lên kế hoạch", emoji: "📋" },
        { value: "stress", label: t("onboarding.questions.challenges.stress") || "Áp lực, lo lắng", emoji: "😰" },
      ],
    },
    // Interview Question 4: Preferred Time
    {
      type: "question",
      questionType: "single",
      icon: "🌅",
      color: "#f59e0b",
      title: t("onboarding.questions.time.title") || "Bạn học tốt nhất vào thời điểm nào?",
      field: "preferredTime",
      options: [
        { value: "morning", label: t("onboarding.questions.time.morning") || "Sáng sớm (5-9h)", emoji: "🌅" },
        { value: "afternoon", label: t("onboarding.questions.time.afternoon") || "Buổi trưa (9-14h)", emoji: "☀️" },
        { value: "evening", label: t("onboarding.questions.time.evening") || "Chiều tối (14-19h)", emoji: "🌆" },
        { value: "night", label: t("onboarding.questions.time.night") || "Đêm khuya (19h+)", emoji: "🌙" },
      ],
    },
    // Interview Question 5: Motivation
    {
      type: "question",
      questionType: "single",
      icon: "💪",
      color: "#8b5cf6",
      title: t("onboarding.questions.motivation.title") || "Điều gì thúc đẩy bạn học tập?",
      field: "motivation",
      options: [
        { value: "career", label: t("onboarding.questions.motivation.career") || "Sự nghiệp tương lai", emoji: "💼" },
        { value: "knowledge", label: t("onboarding.questions.motivation.knowledge") || "Đam mê kiến thức", emoji: "🧠" },
        { value: "competition", label: t("onboarding.questions.motivation.competition") || "Cạnh tranh, vượt trội", emoji: "🏆" },
        { value: "family", label: t("onboarding.questions.motivation.family") || "Gia đình kỳ vọng", emoji: "👨‍👩‍👧" },
        { value: "personal", label: t("onboarding.questions.motivation.personal") || "Phát triển bản thân", emoji: "🌟" },
      ],
    },
    // Completion slide
    {
      type: "complete",
      emoji: "🚀",
      title: t("onboarding.complete.title") || "Tuyệt vời! Bạn đã sẵn sàng!",
      subtitle: t("onboarding.complete.subtitle") || "Chúng tôi đã hiểu bạn hơn rồi",
      description: t("onboarding.complete.description") || "Hãy bắt đầu hành trình học tập đầy thú vị cùng Stechdy nhé!",
    },
  ];

  const currentSlide = slides[currentStep];
  const totalSteps = slides.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    // Check if user has completed onboarding before
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
    if (hasCompletedOnboarding === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    // Trigger confetti on completion
    if (currentSlide?.type === "complete") {
      launchConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const launchConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/dashboard");
  };

  const handleComplete = () => {
    // Save user preferences
    localStorage.setItem("onboardingCompleted", "true");
    localStorage.setItem("userPreferences", JSON.stringify(answers));
    navigate("/dashboard");
  };

  const handleOptionSelect = (field, value, isMultiple = false) => {
    if (isMultiple) {
      setAnswers((prev) => {
        const currentValues = prev[field] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [field]: newValues };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [field]: value }));
    }
  };

  const canProceed = () => {
    if (currentSlide?.type === "question") {
      const value = answers[currentSlide.field];
      if (currentSlide.questionType === "multiple") {
        return value && value.length > 0;
      }
      return value && value !== "";
    }
    return true;
  };

  const renderWelcomeSlide = () => (
    <div className="ob-welcome">
      <div className="ob-welcome-emoji-container">
        <span className="ob-welcome-emoji ob-animate-bounce">{currentSlide.emoji}</span>
        <div className="ob-welcome-rings">
          <div className="ob-ring ob-ring-1"></div>
          <div className="ob-ring ob-ring-2"></div>
          <div className="ob-ring ob-ring-3"></div>
        </div>
      </div>
      <h1 className="ob-welcome-title">{currentSlide.title}</h1>
      <p className="ob-welcome-subtitle">{currentSlide.subtitle}</p>
      <p className="ob-welcome-description">{currentSlide.description}</p>
      <div className="ob-welcome-mascot">
        <div className="ob-mascot-body">
          <div className="ob-mascot-face">
            <div className="ob-mascot-eyes">
              <span className="ob-eye">👁️</span>
              <span className="ob-eye">👁️</span>
            </div>
            <span className="ob-mascot-smile">😊</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatureSlide = () => (
    <div className="ob-feature">
      <div
        className="ob-feature-icon-container"
        style={{ "--feature-color": currentSlide.color }}
      >
        <img 
          src={currentSlide.image} 
          alt={currentSlide.title} 
          className="ob-feature-icon"
          onError={(e) => {
            // Fallback to a default image if loading fails
            e.target.src = ideaIcon;
          }}
        />
        <div className="ob-feature-glow"></div>
      </div>
      <h2 className="ob-feature-title">{currentSlide.title}</h2>
      <p className="ob-feature-description">{currentSlide.description}</p>
      <div className="ob-feature-highlights">
        {currentSlide.highlights.map((highlight, index) => (
          <div
            key={index}
            className="ob-highlight-item"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <span className="ob-highlight-text">{highlight}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuestionSlide = () => (
    <div className="ob-question">
      <div
        className="ob-question-icon-container"
        style={{ "--question-color": currentSlide.color }}
      >
        <span className="ob-question-icon">{currentSlide.icon}</span>
        <div className="ob-question-glow"></div>
      </div>
      <h2 className="ob-question-title">{currentSlide.title}</h2>
      {currentSlide.subtitle && (
        <p className="ob-question-subtitle">{currentSlide.subtitle}</p>
      )}
      <div className="ob-question-options">
        {currentSlide.options.map((option, index) => {
          const isSelected =
            currentSlide.questionType === "multiple"
              ? (answers[currentSlide.field] || []).includes(option.value)
              : answers[currentSlide.field] === option.value;

          return (
            <button
              key={option.value}
              className={`ob-option-button ${isSelected ? "ob-selected" : ""}`}
              onClick={() =>
                handleOptionSelect(
                  currentSlide.field,
                  option.value,
                  currentSlide.questionType === "multiple"
                )
              }
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="ob-option-label">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCompleteSlide = () => (
    <div className="ob-complete">
      <div className="ob-complete-emoji-container">
        <span className="ob-complete-emoji ob-animate-rocket">{currentSlide.emoji}</span>
        <div className="ob-complete-stars">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="ob-star"
              style={{
                "--delay": `${i * 0.2}s`,
                "--x": `${Math.random() * 200 - 100}px`,
                "--y": `${Math.random() * 200 - 100}px`,
              }}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>
      <h1 className="ob-complete-title">{currentSlide.title}</h1>
      <p className="ob-complete-subtitle">{currentSlide.subtitle}</p>
      <p className="ob-complete-description">{currentSlide.description}</p>
    </div>
  );

  const renderSlideContent = () => {
    switch (currentSlide?.type) {
      case "welcome":
        return renderWelcomeSlide();
      case "feature":
        return renderFeatureSlide();
      case "question":
        return renderQuestionSlide();
      case "complete":
        return renderCompleteSlide();
      default:
        return null;
    }
  };

  return (
    <div className="ob-page">
      {/* Background decorations */}
      <div className="ob-bg">
        <div className="ob-bg-gradient"></div>
        <div className="ob-bg-shapes">
          <div className="ob-shape ob-shape-1"></div>
          <div className="ob-shape ob-shape-2"></div>
          <div className="ob-shape ob-shape-3"></div>
          <div className="ob-shape ob-shape-4"></div>
        </div>
        <div className="ob-bg-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="ob-particle"
              style={{
                "--x": `${Math.random() * 100}%`,
                "--y": `${Math.random() * 100}%`,
                "--delay": `${Math.random() * 5}s`,
                "--duration": `${3 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="onboarding-header">
        <div className="header-logo">
          <img 
            src={`${process.env.PUBLIC_URL}/LogoAIStechdy.png`} 
            alt="AIStechdy Logo" 
            className="logo-icon"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="logo-text">Stechdy</span>
        </div>
      </div>
      
      {/* Skip button - fixed position */}
      {currentStep > 0 && currentStep < totalSteps - 1 && (
        <button className="ob-skip-btn" onClick={handleSkip}>
          {t("onboarding.skip") || "Bỏ qua"}
        </button>
      )}

      {/* Progress bar */}
      <div className="ob-progress">
        <div className="ob-progress-bar">
          <div
            className="ob-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="ob-progress-text">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Main content */}
      <div className={`ob-content ${isAnimating ? "ob-animating" : ""}`}>
        {renderSlideContent()}
      </div>

      {/* Navigation */}
      <div className="ob-nav">
        {currentStep > 0 && currentSlide?.type !== "complete" && (
          <button className="ob-nav-btn ob-nav-prev" onClick={handlePrev}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("onboarding.back") || "Quay lại"}
          </button>
        )}

        {currentSlide?.type === "complete" ? (
          <button className="ob-nav-btn ob-nav-start" onClick={handleComplete}>
            {t("onboarding.start") || "Bắt đầu ngay!"}
            <span className="ob-btn-emoji">🚀</span>
          </button>
        ) : (
          <button
            className="ob-nav-btn ob-nav-next"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {t("onboarding.next") || "Tiếp tục"}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Step indicators */}
      <div className="ob-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`ob-dot ${index === currentStep ? "ob-active" : ""} ${
              index < currentStep ? "ob-completed" : ""
            }`}
            onClick={() => index < currentStep && setCurrentStep(index)}
            disabled={index > currentStep}
          />
        ))}
      </div>
      
      {/* Language Switcher */}
      <div className="ob-lang-switcher">
        <button
          className={`ob-lang-btn ${currentLanguage === "vi" ? "ob-active" : ""}`}
          onClick={() => changeLanguage("vi")}
        >
          <span className="ob-lang-flag">🇻🇳</span>
          <span className="ob-lang-text">VI</span>
        </button>
        <button
          className={`ob-lang-btn ${currentLanguage === "en" ? "ob-active" : ""}`}
          onClick={() => changeLanguage("en")}
        >
          <span className="ob-lang-flag">🇺🇸</span>
          <span className="ob-lang-text">EN</span>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
