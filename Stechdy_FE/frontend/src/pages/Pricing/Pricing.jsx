import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import PaymentModal from "../../components/payment/PaymentModal";
import "./Pricing.css";

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

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    <path d="M5 19l.5 1.5L7 21l-1.5.5L5 23l-.5-1.5L3 21l1.5-.5L5 19z" />
    <path d="M19 5l.5 1.5L21 7l-1.5.5L19 9l-.5-1.5L17 7l1.5-.5L19 5z" />
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

const Pricing = () => {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: t("pricing.plans.free.name"),
      price: 0,
      currency: "VND",
      description: t("pricing.plans.free.description"),
      features: [
        t("pricing.plans.free.features.basicScheduling"),
        t("pricing.plans.free.features.moodTracking"),
        t("pricing.plans.free.features.limitedAnalytics"),
        t("pricing.plans.free.features.basicGoals"),
      ],
      icon: <SparkleIcon />,
      buttonText: t("pricing.plans.free.buttonText"),
      buttonVariant: "secondary",
      isCurrent: true,
    },
    {
      id: "oneMonth",
      name: t("pricing.plans.oneMonth.name"),
      price: 39000,
      originalPrice: 39000,
      duration: "1 " + t("pricing.month"),
      currency: "VND",
      description: t("pricing.plans.oneMonth.description"),
      features: [
        t("pricing.plans.oneMonth.features.everything"),
        t("pricing.plans.oneMonth.features.advancedAnalytics"),
        t("pricing.plans.oneMonth.features.customGoals"),
        t("pricing.plans.oneMonth.features.exportData"),
        t("pricing.plans.oneMonth.features.prioritySupport"),
      ],
      icon: <RocketIcon />,
      buttonText: t("pricing.plans.oneMonth.buttonText"),
      buttonVariant: "primary",
    },
    {
      id: "threeMonths",
      name: t("pricing.plans.threeMonths.name"),
      price: 99000,
      originalPrice: 117000,
      discount: "15%",
      duration: "3 " + t("pricing.months"),
      currency: "VND",
      description: t("pricing.plans.threeMonths.description"),
      features: [
        t("pricing.plans.threeMonths.features.everything"),
        t("pricing.plans.threeMonths.features.aiInsights"),
        t("pricing.plans.threeMonths.features.collaboration"),
        t("pricing.plans.threeMonths.features.customThemes"),
        t("pricing.plans.threeMonths.features.advancedMood"),
        t("pricing.plans.threeMonths.features.integrations"),
      ],
      icon: <ZapIcon />,
      buttonText: t("pricing.plans.threeMonths.buttonText"),
      buttonVariant: "primary",
      isPopular: true,
    },
    {
      id: "oneYear",
      name: t("pricing.plans.oneYear.name"),
      price: 299000,
      originalPrice: 468000,
      discount: "36%",
      duration: "1 " + t("pricing.year"),
      currency: "VND",
      description: t("pricing.plans.oneYear.description"),
      features: [
        t("pricing.plans.oneYear.features.everything"),
        t("pricing.plans.oneYear.features.aiCoach"),
        t("pricing.plans.oneYear.features.unlimitedStorage"),
        t("pricing.plans.oneYear.features.apiAccess"),
        t("pricing.plans.oneYear.features.dedicatedSupport"),
        t("pricing.plans.oneYear.features.earlyAccess"),
        t("pricing.plans.oneYear.features.customBranding"),
      ],
      icon: <CrownIcon />,
      buttonText: t("pricing.plans.oneYear.buttonText"),
      buttonVariant: "dark",
    },
  ];

  const formatPrice = (price) => {
    if (price === 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleSelectPlan = (plan) => {
    if (plan.id === "free") {
      navigate("/register");
    } else {
      // Open payment modal for paid plans
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  return (
    <div className="pricing-page-container">
      <SidebarNav />
      <div className="pricing-page">
        {/* Header */}
        <div className="pricing-header">
          <div className="pricing-header-spacer"></div>
          <h1 className="pricing-page-title">{t("pricing.title")}</h1>
          <button className="notification-btn" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 106 8C6 15 3 17 3 17H21S18 15 18 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="pricing-main">
          <p className="pricing-subtitle">{t("pricing.subtitle")}</p>

          {/* Pricing Cards */}
          <div className="pricing-cards-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.isPopular ? "pricing-card-popular" : ""
                  } ${plan.id === "oneYear" ? "pricing-card-dark" : ""}`}
              >
                {plan.isPopular && (
                  <div className="pricing-popular-badge">
                    {t("pricing.mostPopular")}
                  </div>
                )}
                {plan.discount && (
                  <div className="pricing-discount-badge-card">
                    -{plan.discount}
                  </div>
                )}

                <div className="pricing-card-header">
                  <div className="pricing-card-icon">{plan.icon}</div>
                  <h3 className="pricing-card-name">{plan.name}</h3>
                </div>

                <div className="pricing-card-price">
                  <span className="pricing-currency">₫</span>
                  <span className="pricing-amount">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.duration && (
                    <span className="pricing-period">/{plan.duration}</span>
                  )}
                </div>

                {plan.originalPrice && plan.originalPrice !== plan.price && (
                  <div className="pricing-original-price">
                    <span className="pricing-strikethrough">
                      ₫{formatPrice(plan.originalPrice)}
                    </span>
                  </div>
                )}

                <p className="pricing-card-description">{plan.description}</p>

                <button
                  className={`pricing-card-btn pricing-card-btn-${plan.buttonVariant}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.isCurrent ? t("pricing.currentPlan") : plan.buttonText}
                </button>

                <ul className="pricing-features-list">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="pricing-feature-item">
                      <span className="pricing-feature-check">
                        <CheckIcon />
                      </span>
                      <span className="pricing-feature-text">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <section className="pricing-faq-section">
            <h2 className="pricing-faq-title">{t("pricing.faq.title")}</h2>
            <div className="pricing-faq-grid">
              <div className="pricing-faq-item">
                <h4 className="pricing-faq-question">
                  {t("pricing.faq.q1.question")}
                </h4>
                <p className="pricing-faq-answer">{t("pricing.faq.q1.answer")}</p>
              </div>
              <div className="pricing-faq-item">
                <h4 className="pricing-faq-question">
                  {t("pricing.faq.q2.question")}
                </h4>
                <p className="pricing-faq-answer">{t("pricing.faq.q2.answer")}</p>
              </div>
              <div className="pricing-faq-item">
                <h4 className="pricing-faq-question">
                  {t("pricing.faq.q3.question")}
                </h4>
                <p className="pricing-faq-answer">{t("pricing.faq.q3.answer")}</p>
              </div>
              <div className="pricing-faq-item">
                <h4 className="pricing-faq-question">
                  {t("pricing.faq.q4.question")}
                </h4>
                <p className="pricing-faq-answer">{t("pricing.faq.q4.answer")}</p>
              </div>
            </div>
          </section>
        </div>
        <BottomNav />
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        planData={selectedPlan}
      />
    </div>
  );
};

export default Pricing;
