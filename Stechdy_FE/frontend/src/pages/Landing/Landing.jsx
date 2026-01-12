import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import "./Landing.css";

// SVG Icons as components for better maintainability
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

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { resolvedTheme, setThemeMode } = useTheme();
  const { t } = useTranslation();

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

  // Close mobile menu when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <CalendarIcon />,
      title: t("features.smartScheduling.title"),
      description: t("features.smartScheduling.description"),
    },
    {
      icon: <SmileIcon />,
      title: t("features.moodTracking.title"),
      description: t("features.moodTracking.description"),
    },
    {
      icon: <TrendingUpIcon />,
      title: t("features.progressAnalytics.title"),
      description: t("features.progressAnalytics.description"),
    },
    {
      icon: <TargetIcon />,
      title: t("features.goalSetting.title"),
      description: t("features.goalSetting.description"),
    },
    {
      icon: <ClockIcon />,
      title: t("features.timeManagement.title"),
      description: t("features.timeManagement.description"),
    },
    {
      icon: <BookIcon />,
      title: t("features.studySessions.title"),
      description: t("features.studySessions.description"),
    },
  ];

  const steps = [
    {
      number: 1,
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
    },
    {
      number: 2,
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
    },
    {
      number: 3,
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
    },
    {
      text: t("testimonials.testimonial2.text"),
      name: t("testimonials.testimonial2.name"),
      role: t("testimonials.testimonial2.role"),
      avatar: "JW",
    },
    {
      text: t("testimonials.testimonial3.text"),
      name: t("testimonials.testimonial3.name"),
      role: t("testimonials.testimonial3.role"),
      avatar: "ER",
    },
  ];

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon">
            <BookIcon />
          </div>
          <span className="landing-logo-text">S'Techdy</span>
        </Link>

        <div className="landing-nav-links">
          <span
            className="landing-nav-link"
            onClick={() => scrollToSection("features")}
          >
            {t("nav.features")}
          </span>
          <span
            className="landing-nav-link"
            onClick={() => scrollToSection("how-it-works")}
          >
            {t("nav.howItWorks")}
          </span>
          <span
            className="landing-nav-link"
            onClick={() => scrollToSection("testimonials")}
          >
            {t("nav.testimonials")}
          </span>
          <Link to="/pricing" className="landing-nav-link">
            {t("nav.pricing")}
          </Link>
        </div>

        <div className="landing-nav-actions">
          <LanguageSwitcher />
          <button
            className="landing-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              resolvedTheme === "dark"
                ? t("theme.switchToLight")
                : t("theme.switchToDark")
            }
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to="/login" className="landing-btn landing-btn-secondary">
            {t("nav.signIn")}
          </Link>
          <Link to="/register" className="landing-btn landing-btn-primary">
            {t("nav.getStarted")}
          </Link>
        </div>

        <button
          className="landing-menu-btn"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`landing-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <span
          className="landing-mobile-menu-link"
          onClick={() => scrollToSection("features")}
        >
          {t("nav.features")}
        </span>
        <span
          className="landing-mobile-menu-link"
          onClick={() => scrollToSection("how-it-works")}
        >
          {t("nav.howItWorks")}
        </span>
        <span
          className="landing-mobile-menu-link"
          onClick={() => scrollToSection("testimonials")}
        >
          {t("nav.testimonials")}
        </span>
        <Link
          to="/pricing"
          className="landing-mobile-menu-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          {t("nav.pricing")}
        </Link>
        <div className="landing-mobile-menu-settings">
          <LanguageSwitcher />
          <button className="landing-mobile-theme-toggle" onClick={toggleTheme}>
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span>
              {resolvedTheme === "dark"
                ? t("theme.lightMode")
                : t("theme.darkMode")}
            </span>
          </button>
        </div>
        <div className="landing-mobile-menu-actions">
          <Link
            to="/login"
            className="landing-btn landing-btn-secondary"
            style={{ width: "100%" }}
          >
            {t("nav.signIn")}
          </Link>
          <Link
            to="/register"
            className="landing-btn landing-btn-primary"
            style={{ width: "100%" }}
          >
            {t("nav.getStarted")}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="landing-hero-title">
            {t("hero.title")}
            <br />
            <span className="landing-hero-title-gradient">
              {t("hero.titleGradient")}
            </span>
          </h1>

          <p className="landing-hero-subtitle">{t("hero.subtitle")}</p>

          <div className="landing-hero-actions">
            <Link
              to="/register"
              className="landing-btn landing-btn-primary landing-btn-large"
            >
              {t("hero.startFreeTrial")}
              <ArrowRightIcon />
            </Link>
            <Link
              to="/login"
              className="landing-btn landing-btn-secondary landing-btn-large"
            >
              {t("nav.signIn")}
            </Link>
          </div>

          <div className="landing-hero-stats">
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-value">10K+</div>
              <div className="landing-hero-stat-label">
                {t("hero.stats.activeStudents")}
              </div>
            </div>
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-value">95%</div>
              <div className="landing-hero-stat-label">
                {t("hero.stats.improvedFocus")}
              </div>
            </div>
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-value">4.9</div>
              <div className="landing-hero-stat-label">
                {t("hero.stats.userRating")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="landing-section-header">
          <span className="landing-section-badge">{t("features.badge")}</span>
          <h2 className="landing-section-title">{t("features.title")}</h2>
          <p className="landing-section-subtitle">{t("features.subtitle")}</p>
        </div>

        <div className="landing-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="landing-feature-card">
              <div className="landing-feature-icon">{feature.icon}</div>
              <h3 className="landing-feature-title">{feature.title}</h3>
              <p className="landing-feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-how-it-works">
        <div className="landing-section-header">
          <span className="landing-section-badge">{t("howItWorks.badge")}</span>
          <h2 className="landing-section-title">{t("howItWorks.title")}</h2>
          <p className="landing-section-subtitle">{t("howItWorks.subtitle")}</p>
        </div>

        <div className="landing-steps">
          {steps.map((step, index) => (
            <div key={index} className="landing-step">
              <div className="landing-step-number">{step.number}</div>
              <h3 className="landing-step-title">{step.title}</h3>
              <p className="landing-step-description">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="landing-step-connector" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="landing-testimonials">
        <div className="landing-section-header">
          <span className="landing-section-badge">
            {t("testimonials.badge")}
          </span>
          <h2 className="landing-section-title">{t("testimonials.title")}</h2>
          <p className="landing-section-subtitle">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="landing-testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="landing-testimonial-card">
              <div className="landing-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="landing-testimonial-text">{testimonial.text}</p>
              <div className="landing-testimonial-author">
                <div className="landing-testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="landing-testimonial-info">
                  <p className="landing-testimonial-name">{testimonial.name}</p>
                  <p className="landing-testimonial-role">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-card">
          <div className="landing-cta-content">
            <h2 className="landing-cta-title">{t("cta.title")}</h2>
            <p className="landing-cta-subtitle">{t("cta.subtitle")}</p>
            <Link to="/register" className="landing-cta-btn">
              {t("cta.button")}
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <div className="landing-footer-logo">
            <div className="landing-footer-logo-icon">
              <BookIcon />
            </div>
            <span className="landing-footer-logo-text">S'Techdy</span>
          </div>

          <div className="landing-footer-links">
            <span
              className="landing-footer-link"
              onClick={() => scrollToSection("features")}
            >
              {t("nav.features")}
            </span>
            <span
              className="landing-footer-link"
              onClick={() => scrollToSection("how-it-works")}
            >
              {t("nav.howItWorks")}
            </span>
            <span
              className="landing-footer-link"
              onClick={() => scrollToSection("testimonials")}
            >
              {t("nav.testimonials")}
            </span>
            <Link to="/pricing" className="landing-footer-link">
              {t("nav.pricing")}
            </Link>
            <Link to="/login" className="landing-footer-link">
              {t("nav.signIn")}
            </Link>
          </div>

          <p className="landing-footer-copyright">{t("footer.copyright")}</p>
        </div>
      </footer>

      {/* Scroll To Top Button */}
      <button
        className={`scroll-to-top-btn ${showScrollTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUpIcon />
      </button>
    </div>
  );
};

export default Landing;
