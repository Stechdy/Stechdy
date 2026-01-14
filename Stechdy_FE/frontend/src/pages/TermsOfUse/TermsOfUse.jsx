import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAuthenticated } from "../../services/authService";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import "./TermsOfUse.css";

const TermsOfUse = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAuth = isAuthenticated();

  const sections = [
    {
      id: "acceptance",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.acceptance.title"),
      content: t("termsOfUse.sections.acceptance.content"),
    },
    {
      id: "eligibility",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M20 8V14M23 11H17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.eligibility.title"),
      content: t("termsOfUse.sections.eligibility.content"),
    },
    {
      id: "account",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="11"
            width="18"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.account.title"),
      content: t("termsOfUse.sections.account.content"),
    },
    {
      id: "usage",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 8V12L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.usage.title"),
      content: t("termsOfUse.sections.usage.content"),
    },
    {
      id: "intellectualProperty",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.intellectualProperty.title"),
      content: t("termsOfUse.sections.intellectualProperty.content"),
    },
    {
      id: "privacy",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.privacy.title"),
      content: t("termsOfUse.sections.privacy.content"),
    },
    {
      id: "termination",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M15 9L9 15M9 9L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.termination.title"),
      content: t("termsOfUse.sections.termination.content"),
    },
    {
      id: "disclaimer",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.35 1.64 19.7 1.82 20C2.00 20.3 2.26 20.56 2.56 20.74C2.86 20.93 3.21 21.02 3.56 21.02H20.49C20.84 21.02 21.19 20.93 21.49 20.74C21.79 20.56 22.05 20.3 22.23 20C22.41 19.7 22.50 19.35 22.50 19C22.50 18.65 22.41 18.3 22.23 18L13.76 3.86C13.58 3.56 13.32 3.3 13.02 3.12C12.72 2.94 12.37 2.85 12.02 2.85C11.67 2.85 11.32 2.94 11.02 3.12C10.72 3.3 10.46 3.56 10.29 3.86Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 9V13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      ),
      title: t("termsOfUse.sections.disclaimer.title"),
      content: t("termsOfUse.sections.disclaimer.content"),
    },
    {
      id: "changes",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.changes.title"),
      content: t("termsOfUse.sections.changes.content"),
    },
    {
      id: "contact",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 6L12 13L2 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      title: t("termsOfUse.sections.contact.title"),
      content: t("termsOfUse.sections.contact.content"),
    },
  ];

  return (
    <div className="terms-page">
      {isAuth && <SidebarNav />}
      <div className="terms-wrapper">
        <div className="terms-content">
          {/* Page Title */}
          <div className="terms-header-section">
            <button
              className="terms-back-btn"
              onClick={() => navigate(isAuth ? -1 : "/")}
              aria-label={t("common.back")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="terms-page-title">{t("termsOfUse.title")}</h1>
          </div>

          {/* Hero Section */}
          <div className="terms-hero-card">
            <div className="terms-hero-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 13H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 9H9H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="terms-hero-subtitle">{t("termsOfUse.subtitle")}</p>
            <p className="terms-hero-date">
              {t("termsOfUse.lastUpdated")}: {t("termsOfUse.effectiveDate")}
            </p>
          </div>

          {/* Introduction */}
          <div className="terms-intro-card">
            <p>{t("termsOfUse.introduction")}</p>
          </div>

          {/* Sections */}
          <div className="terms-sections-card">
            {sections.map((section, index) => (
              <div key={section.id} className="terms-section">
                <div className="section-header">
                  <div className={`section-icon section-icon-${index % 5}`}>
                    {section.icon}
                  </div>
                  <h2 className="section-title">{section.title}</h2>
                </div>
                <p className="section-content">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="terms-footer-card">
            <p className="terms-footer-text">{t("termsOfUse.footer")}</p>
            <a
              href="mailto:stechdy.work@gmail.com"
              className="terms-email-link"
            >
              stechdy.work@gmail.com
            </a>
          </div>
        </div>

        {isAuth && <BottomNav />}
      </div>
    </div>
  );
};

export default TermsOfUse;
