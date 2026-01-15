import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { isAuthenticated } from "../../services/authService";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import "./LandingNew.css";

// SVG Icons as components
const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SmileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TargetIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const BellIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SparklesIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// SVG Icons
const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RocketIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const CrownIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const ZapIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const LandingNew = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { resolvedTheme, setThemeMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleTheme = () => {
    setThemeMode(resolvedTheme === "dark" ? "light" : "dark");
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePricingClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      // Store return URL and redirect to login
      navigate("/login", { state: { from: "/pricing" } });
    } else {
      navigate("/pricing");
    }
  };

  const openVideoModal = () => {
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <CalendarIcon />,
      title: t("features.smartScheduling.title"),
      description: t("features.smartScheduling.description"),
      color: "pink",
    },
    {
      icon: <SmileIcon />,
      title: t("features.moodTracking.title"),
      description: t("features.moodTracking.description"),
      color: "blue",
    },
    {
      icon: <TrendingUpIcon />,
      title: t("features.progressAnalytics.title"),
      description: t("features.progressAnalytics.description"),
      color: "purple",
    },
    {
      icon: <TargetIcon />,
      title: t("features.goalSetting.title"),
      description: t("features.goalSetting.description"),
      color: "green",
    },
    {
      icon: <ClockIcon />,
      title: t("features.timeManagement.title"),
      description: t("features.timeManagement.description"),
      color: "orange",
    },
    {
      icon: <BookIcon />,
      title: t("features.studySessions.title"),
      description: t("features.studySessions.description"),
      color: "teal",
    },
  ];

  const steps = [
    {
      number: 1,
      icon: <UserIcon />,
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      number: 2,
      icon: <CalendarIcon />,
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      number: 3,
      icon: <TrendingUpIcon />,
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
    },
  ];

  const testimonials = [
    {
      text: t("testimonials.testimonial1.text"),
      name: t("testimonials.testimonial1.name"),
      role: t("testimonials.testimonial1.role"),
      avatar: "SC",
      rating: 5,
    },
    {
      text: t("testimonials.testimonial2.text"),
      name: t("testimonials.testimonial2.name"),
      role: t("testimonials.testimonial2.role"),
      avatar: "JW",
      rating: 5,
    },
    {
      text: t("testimonials.testimonial3.text"),
      name: t("testimonials.testimonial3.name"),
      role: t("testimonials.testimonial3.role"),
      avatar: "ER",
      rating: 5,
    },
  ];

  return (
    <div className="landing-new">
      {/* Floating Decorations */}
      <div className="landing-new__decorations">
        <div className="landing-new__blob landing-new__blob--1" />
        <div className="landing-new__blob landing-new__blob--2" />
        <div className="landing-new__blob landing-new__blob--3" />
      </div>

      {/* Navbar */}
      <nav className="landing-new__navbar">
        <Link to="/" className="landing-new__logo">
          <img
            src="/Stechdy_logo.png"
            alt="S'Techdy"
            className="landing-new__logo-img"
          />
          <span className="landing-new__logo-text">S'Techdy</span>
        </Link>

        <div className="landing-new__nav-links">
          <span
            className="landing-new__nav-link"
            onClick={() => scrollToSection("features")}
          >
            {t("nav.features")}
          </span>
          <span
            className="landing-new__nav-link"
            onClick={() => scrollToSection("how-it-works")}
          >
            {t("nav.howItWorks")}
          </span>
          <span
            className="landing-new__nav-link"
            onClick={() => scrollToSection("testimonials")}
          >
            {t("nav.testimonials")}
          </span>
          <span
            className="landing-new__nav-link"
            onClick={() => scrollToSection("pricing")}
          >
            {t("nav.pricing")}
          </span>
        </div>

        <div className="landing-new__nav-actions">
          <LanguageSwitcher />
          <button
            className="landing-new__theme-toggle"
            onClick={toggleTheme}
            aria-label={
              resolvedTheme === "dark"
                ? t("theme.switchToLight")
                : t("theme.switchToDark")
            }
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link
            to="/login"
            className="landing-new__btn landing-new__btn--outline"
          >
            {t("nav.signIn")}
          </Link>
          <Link
            to="/register"
            className="landing-new__btn landing-new__btn--primary"
          >
            {t("nav.getStarted")}
          </Link>
        </div>

        <button
          className="landing-new__menu-btn"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`landing-new__mobile-menu ${
          mobileMenuOpen ? "landing-new__mobile-menu--open" : ""
        }`}
      >
        <span
          className="landing-new__mobile-link"
          onClick={() => scrollToSection("features")}
        >
          {t("nav.features")}
        </span>
        <span
          className="landing-new__mobile-link"
          onClick={() => scrollToSection("how-it-works")}
        >
          {t("nav.howItWorks")}
        </span>
        <span
          className="landing-new__mobile-link"
          onClick={() => scrollToSection("testimonials")}
        >
          {t("nav.testimonials")}
        </span>
        <span
          className="landing-new__mobile-link"
          onClick={() => scrollToSection("pricing")}
        >
          {t("nav.pricing")}
        </span>
        <div className="landing-new__mobile-settings">
          <LanguageSwitcher />
          <button className="landing-new__mobile-theme" onClick={toggleTheme}>
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span>
              {resolvedTheme === "dark"
                ? t("theme.lightMode")
                : t("theme.darkMode")}
            </span>
          </button>
        </div>
        <div className="landing-new__mobile-actions">
          <Link
            to="/login"
            className="landing-new__btn landing-new__btn--outline"
            style={{ width: "100%" }}
          >
            {t("nav.signIn")}
          </Link>
          <Link
            to="/register"
            className="landing-new__btn landing-new__btn--primary"
            style={{ width: "100%" }}
          >
            {t("nav.getStarted")}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="landing-new__hero">
        <div className="landing-new__hero-content">
          <div className="landing-new__hero-badge">
            <SparklesIcon />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="landing-new__hero-title">
            {t("hero.title")}
            <span className="landing-new__hero-title--gradient">
              {t("hero.titleGradient")}
            </span>
          </h1>

          <p className="landing-new__hero-subtitle">{t("hero.subtitle")}</p>

          <div className="landing-new__hero-actions">
            <Link
              to="/register"
              className="landing-new__btn landing-new__btn--primary landing-new__btn--large"
            >
              {t("hero.startFreeTrial")}
              <ArrowRightIcon />
            </Link>
            <button
              className="landing-new__btn landing-new__btn--ghost landing-new__btn--large"
              onClick={openVideoModal}
            >
              <PlayIcon />
              {t("hero.watchDemo")}
            </button>
          </div>

          <div className="landing-new__hero-stats">
            <div className="landing-new__stat-card">
              <div className="landing-new__stat-value">10K+</div>
              <div className="landing-new__stat-label">
                {t("hero.stats.activeStudents")}
              </div>
            </div>
            <div className="landing-new__stat-card">
              <div className="landing-new__stat-value">95%</div>
              <div className="landing-new__stat-label">
                {t("hero.stats.improvedFocus")}
              </div>
            </div>
            <div className="landing-new__stat-card">
              <div className="landing-new__stat-value">4.9</div>
              <div className="landing-new__stat-label">
                {t("hero.stats.userRating")}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="landing-new__hero-visual">
          <div className="landing-new__hero-mockup">
            <div className="landing-new__mockup-header">
              <div className="landing-new__mockup-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="landing-new__mockup-content">
              <div className="landing-new__mockup-card landing-new__mockup-card--mood">
                <SmileIcon />
                <span>{t("hero.mockup.moodGreat")}</span>
              </div>
              <div className="landing-new__mockup-card landing-new__mockup-card--progress">
                <TrendingUpIcon />
                <span>{t("hero.mockup.progressWeek")}</span>
              </div>
              <div className="landing-new__mockup-card landing-new__mockup-card--session">
                <ClockIcon />
                <span>{t("hero.mockup.studyTime")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="landing-new__trusted">
        <p className="landing-new__trusted-text">{t("trusted.text")}</p>
        <div className="landing-new__trusted-logos">
          <div className="landing-new__trusted-logo">Harvard</div>
          <div className="landing-new__trusted-logo">Stanford</div>
          <div className="landing-new__trusted-logo">MIT</div>
          <div className="landing-new__trusted-logo">Oxford</div>
          <div className="landing-new__trusted-logo">Cambridge</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-new__features">
        <div className="landing-new__section-header">
          <span className="landing-new__section-badge">
            {t("features.badge")}
          </span>
          <h2 className="landing-new__section-title">{t("features.title")}</h2>
          <p className="landing-new__section-subtitle">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="landing-new__features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`landing-new__feature-card landing-new__feature-card--${feature.color}`}
            >
              <div className="landing-new__feature-icon">{feature.icon}</div>
              <h3 className="landing-new__feature-title">{feature.title}</h3>
              <p className="landing-new__feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-new__how-it-works">
        <div className="landing-new__section-header">
          <span className="landing-new__section-badge">
            {t("howItWorks.badge")}
          </span>
          <h2 className="landing-new__section-title">
            {t("howItWorks.title")}
          </h2>
          <p className="landing-new__section-subtitle">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="landing-new__steps">
          {steps.map((step, index) => (
            <div key={index} className="landing-new__step">
              <div className="landing-new__step-number">{step.number}</div>
              <div className="landing-new__step-icon">{step.icon}</div>
              <h3 className="landing-new__step-title">{step.title}</h3>
              <p className="landing-new__step-desc">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="landing-new__step-connector" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="landing-new__testimonials">
        <div className="landing-new__section-header">
          <span className="landing-new__section-badge">
            {t("testimonials.badge")}
          </span>
          <h2 className="landing-new__section-title">
            {t("testimonials.title")}
          </h2>
          <p className="landing-new__section-subtitle">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="landing-new__testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="landing-new__testimonial-card">
              <div className="landing-new__testimonial-stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="landing-new__testimonial-text">
                {testimonial.text}
              </p>
              <div className="landing-new__testimonial-author">
                <div className="landing-new__testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="landing-new__testimonial-info">
                  <p className="landing-new__testimonial-name">
                    {testimonial.name}
                  </p>
                  <p className="landing-new__testimonial-role">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="landing-new__pricing">
        <div className="landing-new__section-header">
          <span className="landing-new__section-badge">
            {t("landingPricing.badge")}
          </span>
          <h2 className="landing-new__section-title">
            {t("landingPricing.title")}
          </h2>
          <p className="landing-new__section-subtitle">
            {t("landingPricing.subtitle")}
          </p>
        </div>

        <div className="landing-new__pricing-grid">
          {/* 1 Month Plan */}
          <div className="landing-new__pricing-card">
            {/* <div className="landing-new__pricing-badge-discount">
              {t("landingPricing.oneMonth.discount")}
            </div> */}
            <div className="landing-new__pricing-card-icon">
              <RocketIcon />
            </div>
            <h3 className="landing-new__pricing-card-name">
              {t("landingPricing.oneMonth.name")}
            </h3>
            <div className="landing-new__pricing-card-price">
              <span className="landing-new__pricing-currency">
                {t("landingPricing.oneMonth.currency")}
              </span>
              <span className="landing-new__pricing-amount">
                {t("landingPricing.oneMonth.price")}
              </span>
              <span className="landing-new__pricing-period">
                {t("landingPricing.oneMonth.period")}
              </span>
            </div>
            <div className="landing-new__pricing-original">
              <span className="landing-new__pricing-strikethrough">
                {t("landingPricing.oneMonth.currency")}
                {t("landingPricing.oneMonth.originalPrice")}
              </span>
            </div>
            <p className="landing-new__pricing-card-desc">
              {t("landingPricing.oneMonth.description")}
            </p>
            <button
              onClick={handlePricingClick}
              className="landing-new__pricing-btn landing-new__pricing-btn--primary"
            >
              {t("landingPricing.oneMonth.button")}
            </button>
            <ul className="landing-new__pricing-features">
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.everything")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.advancedAnalytics")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.customGoals")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.exportData")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.prioritySupport")}</span>
              </li>
            </ul>
          </div>

          {/* 3 Months Plan - Most Popular */}
          <div className="landing-new__pricing-card landing-new__pricing-card--popular">
            <div className="landing-new__pricing-badge-popular">
              {t("landingPricing.threeMonths.popular")}
            </div>
            <div className="landing-new__pricing-badge-discount">
              {t("landingPricing.threeMonths.discount")}
            </div>
            <div className="landing-new__pricing-card-icon">
              <ZapIcon />
            </div>
            <h3 className="landing-new__pricing-card-name">
              {t("landingPricing.threeMonths.name")}
            </h3>
            <div className="landing-new__pricing-card-price">
              <span className="landing-new__pricing-currency">
                {t("landingPricing.threeMonths.currency")}
              </span>
              <span className="landing-new__pricing-amount">
                {t("landingPricing.threeMonths.price")}
              </span>
              <span className="landing-new__pricing-period">
                {t("landingPricing.threeMonths.period")}
              </span>
            </div>
            <div className="landing-new__pricing-original">
              <span className="landing-new__pricing-strikethrough">
                {t("landingPricing.threeMonths.currency")}
                {t("landingPricing.threeMonths.originalPrice")}
              </span>
            </div>
            <p className="landing-new__pricing-card-desc">
              {t("landingPricing.threeMonths.description")}
            </p>
            <button
              onClick={handlePricingClick}
              className="landing-new__pricing-btn landing-new__pricing-btn--primary"
            >
              {t("landingPricing.threeMonths.button")}
            </button>
            <ul className="landing-new__pricing-features">
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.everythingMonth")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.aiInsights")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.collaboration")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.customThemes")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.advancedMood")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.integrations")}</span>
              </li>
            </ul>
          </div>

          {/* 1 Year Plan */}
          <div className="landing-new__pricing-card">
            <div className="landing-new__pricing-badge-discount landing-new__pricing-badge-discount">
              {t("landingPricing.oneYear.discount")}
            </div>
            <div className="landing-new__pricing-card-icon">
              <CrownIcon />
            </div>
            <h3 className="landing-new__pricing-card-name">
              {t("landingPricing.oneYear.name")}
            </h3>
            <div className="landing-new__pricing-card-price">
              <span className="landing-new__pricing-currency">
                {t("landingPricing.oneYear.currency")}
              </span>
              <span className="landing-new__pricing-amount">
                {t("landingPricing.oneYear.price")}
              </span>
              <span className="landing-new__pricing-period">
                {t("landingPricing.oneYear.period")}
              </span>
            </div>
            <div className="landing-new__pricing-original">
              <span className="landing-new__pricing-strikethrough">
                {t("landingPricing.oneYear.currency")}
                {t("landingPricing.oneYear.originalPrice")}
              </span>
            </div>
            <p className="landing-new__pricing-card-desc">
              {t("landingPricing.oneYear.description")}
            </p>
            <button
              onClick={handlePricingClick}
              className="landing-new__pricing-btn landing-new__pricing-btn--primary"
            >
              {t("landingPricing.oneYear.button")}
            </button>
            <ul className="landing-new__pricing-features">
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>
                  {t("landingPricing.features.everythingThreeMonths")}
                </span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.aiCoach")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.unlimitedStorage")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.apiAccess")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.dedicatedSupport")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.earlyAccess")}</span>
              </li>
              <li className="landing-new__pricing-feature">
                <CheckIcon />
                <span>{t("landingPricing.features.customBranding")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="landing-new__pricing-faq">
          <h3 className="landing-new__pricing-faq-title">
            {t("pricing.faq.title")}
          </h3>
          <div className="landing-new__pricing-faq-grid">
            <div className="landing-new__pricing-faq-item">
              <h4 className="landing-new__pricing-faq-question">
                {t("pricing.faq.q1.question")}
              </h4>
              <p className="landing-new__pricing-faq-answer">
                {t("pricing.faq.q1.answer")}
              </p>
            </div>
            <div className="landing-new__pricing-faq-item">
              <h4 className="landing-new__pricing-faq-question">
                {t("pricing.faq.q2.question")}
              </h4>
              <p className="landing-new__pricing-faq-answer">
                {t("pricing.faq.q2.answer")}
              </p>
            </div>
            <div className="landing-new__pricing-faq-item">
              <h4 className="landing-new__pricing-faq-question">
                {t("pricing.faq.q3.question")}
              </h4>
              <p className="landing-new__pricing-faq-answer">
                {t("pricing.faq.q3.answer")}
              </p>
            </div>
            <div className="landing-new__pricing-faq-item">
              <h4 className="landing-new__pricing-faq-question">
                {t("pricing.faq.q4.question")}
              </h4>
              <p className="landing-new__pricing-faq-answer">
                {t("pricing.faq.q4.answer")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-new__cta">
        <div className="landing-new__cta-card">
          <div className="landing-new__cta-content">
            <h2 className="landing-new__cta-title">{t("cta.title")}</h2>
            <p className="landing-new__cta-subtitle">{t("cta.subtitle")}</p>
            <div className="landing-new__cta-actions">
              <Link
                to="/register"
                className="landing-new__btn landing-new__btn--white landing-new__btn--large"
              >
                {t("cta.button")}
                <ArrowRightIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-new__footer">
        <div className="landing-new__footer-content">
          <div className="landing-new__footer-brand">
            <Link to="/" className="landing-new__footer-logo">
              <img
                src="/Stechdy_logo.png"
                alt="S'Techdy"
                className="landing-new__logo-img"
              />
              <span className="landing-new__logo-text">S'Techdy</span>
            </Link>
            <p className="landing-new__footer-desc">
              {t("footer.description")}
            </p>
          </div>

          <div className="landing-new__footer-links-group">
            <h4 className="landing-new__footer-heading">
              {t("footer.product.heading")}
            </h4>
            <div className="landing-new__footer-links">
              <span
                className="landing-new__footer-link"
                onClick={() => scrollToSection("features")}
              >
                {t("footer.product.features")}
              </span>
              <span
                className="landing-new__footer-link"
                onClick={() => scrollToSection("pricing")}
              >
                {t("footer.product.pricing")}
              </span>
              <span
                className="landing-new__footer-link"
                onClick={() => scrollToSection("testimonials")}
              >
                {t("footer.product.testimonials")}
              </span>
            </div>
          </div>

          <div className="landing-new__footer-links-group">
            <h4 className="landing-new__footer-heading">
              {t("footer.company.heading")}
            </h4>
            <div className="landing-new__footer-links">
              <Link to="/about" className="landing-new__footer-link">
                {t("footer.company.about")}
              </Link>
              <Link to="/help-support" className="landing-new__footer-link">
                {t("footer.company.support")}
              </Link>
              <Link to="/terms-of-use" className="landing-new__footer-link">
                {t("footer.company.termsOfUse")}
              </Link>
            </div>
          </div>

          <div className="landing-new__footer-links-group">
            <h4 className="landing-new__footer-heading">
              {t("footer.getStarted.heading")}
            </h4>
            <div className="landing-new__footer-links">
              <Link to="/login" className="landing-new__footer-link">
                {t("footer.getStarted.signIn")}
              </Link>
              <Link to="/register" className="landing-new__footer-link">
                {t("footer.getStarted.createAccount")}
              </Link>
            </div>
          </div>
        </div>

        <div className="landing-new__footer-bottom">
          <p className="landing-new__footer-copyright">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>

      {/* Scroll To Top Button */}
      <button
        className={`landing-new__scroll-top ${
          showScrollTop ? "landing-new__scroll-top--visible" : ""
        }`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUpIcon />
      </button>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="landing-new__video-modal" onClick={closeVideoModal}>
          <div
            className="landing-new__video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="landing-new__video-modal-close"
              onClick={closeVideoModal}
            >
              <CloseIcon />
            </button>
            <video
              className="landing-new__video-player"
              controls
              autoPlay
              src={require("../../assets/Demo.mp4")}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingNew;
