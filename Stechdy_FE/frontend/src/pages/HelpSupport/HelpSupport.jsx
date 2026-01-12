import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import "./HelpSupport.css";

const HelpSupport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      id: 1,
      question: t("helpSupport.faq.q1"),
      answer: t("helpSupport.faq.a1"),
    },
    {
      id: 2,
      question: t("helpSupport.faq.q2"),
      answer: t("helpSupport.faq.a2"),
    },
    {
      id: 3,
      question: t("helpSupport.faq.q3"),
      answer: t("helpSupport.faq.a3"),
    },
    {
      id: 4,
      question: t("helpSupport.faq.q4"),
      answer: t("helpSupport.faq.a4"),
    },
  ];

  const filteredFaqs = faqItems.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleChatWithUs = () => {
    window.open("https://wa.me/1234567890", "_blank");
  };

  const handleSendEmail = () => {
    window.location.href = "mailto:support@stechdy.com";
  };

  return (
    <div className="help-page">
      <SidebarNav />
      <div className="help-wrapper">
        <div className="help-content">
          {/* Page Title */}
          <div className="help-header-section">
            <button className="help-back-btn" onClick={() => navigate("/account")}>
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
            <h1 className="help-page-title">{t("helpSupport.title")}</h1>
          </div>

          {/* Search Bar */}
          <div className="help-search-card">
            <div className="help-search">
              <svg
                className="search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder={t("helpSupport.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Common Questions Section */}
          <div className="help-faq-card">
            <h2 className="help-section-title">{t("helpSupport.commonQuestions")}</h2>
            <div className="faq-list">
            {filteredFaqs.map((item) => (
              <div
                key={item.id}
                className={`faq-item ${
                  expandedFaq === item.id ? "expanded" : ""
                }`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(item.id)}
                >
                  <span>{item.question}</span>
                  <svg
                    className="faq-chevron"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Contact Support Section */}
          <div className="help-contact-card">
            <h2 className="help-section-title">{t("helpSupport.contactSupport")}</h2>
            <div className="contact-buttons">
            <button className="contact-btn chat-btn" onClick={handleChatWithUs}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{t("helpSupport.chatWithUs")}</span>
            </button>
            <button className="contact-btn email-btn" onClick={handleSendEmail}>
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
              <span>{t("helpSupport.sendEmail")}</span>
            </button>
            </div>
          </div>

          {/* Footer Message */}
          <div className="help-footer-card">
            <p>{t("helpSupport.footer")}</p>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default HelpSupport;
