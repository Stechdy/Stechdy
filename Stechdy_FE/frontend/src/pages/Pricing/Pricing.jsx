import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import PaymentModal from "../../components/payment/PaymentModal";
import HappyImg from "../../assets/Happy.png";
import config from "../../config";
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
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [showPendingPopup, setShowPendingPopup] = useState(false);

  // Discount states
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    const checkPendingPayment = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${config.apiUrl}/payments/my-payments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const pending = (data.payments || []).some(
          (p) => p.status === "pending" && new Date(p.expiresAt) > new Date()
        );
        setHasPendingPayment(pending);
      } catch (_) {}
    };
    checkPendingPayment();
  }, []);

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

  // Discount handlers
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Vui lòng nhập mã discount.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setDiscountError("Vui lòng đăng nhập để sử dụng mã discount.");
      return;
    }

    try {
      setDiscountLoading(true);
      setDiscountError("");
      setDiscountData(null);

      const res = await fetch(`${config.apiUrl}/discounts/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: discountCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDiscountError(data.message || "Mã discount không hợp lệ.");
        return;
      }

      console.log('💎 Discount validated successfully:', data.data);
      setDiscountData(data.data);
      setDiscountError("");
    } catch (err) {
      setDiscountError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode("");
    setDiscountData(null);
    setDiscountError("");
  };

  const getDiscountedPrice = (plan) => {
    if (!discountData || plan.id === "free") return plan.price;
    if (discountData.type !== "price_reduction") return plan.price;

    // Check applicable plans
    if (!discountData.applicablePlans.includes("all") && !discountData.applicablePlans.includes(plan.id)) {
      return plan.price;
    }

    let discountAmount = 0;
    if (discountData.discountMethod === "percentage") {
      discountAmount = (plan.price * discountData.discountValue) / 100;
      if (discountData.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, discountData.maxDiscountAmount);
      }
    } else {
      discountAmount = discountData.discountValue;
    }

    return Math.max(0, plan.price - discountAmount);
  };

  const isDiscountApplicable = (plan) => {
    if (!discountData || plan.id === "free") return false;
    return discountData.applicablePlans.includes("all") || discountData.applicablePlans.includes(plan.id);
  };

  const handleSelectPlan = (plan) => {
    if (plan.id === "free") {
      navigate("/register");
    } else if (hasPendingPayment) {
      setShowPendingPopup(true);
    } else {
      // Attach discount info to plan if applicable
      const planWithDiscount = { ...plan };
      if (discountData && isDiscountApplicable(plan)) {
        planWithDiscount.discountCode = discountData.code;
        planWithDiscount.discountData = discountData;
        planWithDiscount.discountedPrice = getDiscountedPrice(plan);
        console.log('💎 Plan with discount applied:', planWithDiscount);
      }
      setSelectedPlan(planWithDiscount);
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

          {/* Discount Code Input */}
          <div className="pricing-discount-section">
            <div className="pricing-discount-input-wrapper">
              <div className="pricing-discount-icon">🎫</div>
              <input
                type="text"
                className="pricing-discount-input"
                placeholder="Nhập mã discount..."
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  if (discountError) setDiscountError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                disabled={!!discountData}
              />
              {discountData ? (
                <button className="pricing-discount-btn remove" onClick={handleRemoveDiscount}>
                  ✕ Xóa
                </button>
              ) : (
                <button
                  className="pricing-discount-btn apply"
                  onClick={handleApplyDiscount}
                  disabled={discountLoading || !discountCode.trim()}
                >
                  {discountLoading ? "..." : "Áp dụng"}
                </button>
              )}
            </div>
            {discountError && <p className="pricing-discount-error">{discountError}</p>}
            {discountData && (
              <div className="pricing-discount-success">
                <span className="pricing-discount-success-icon">✅</span>
                <div className="pricing-discount-success-info">
                  <strong>{discountData.code}</strong> — {discountData.description}
                  <span className="pricing-discount-success-detail">
                    {discountData.type === "price_reduction"
                      ? discountData.discountMethod === "percentage"
                        ? `Giảm ${discountData.discountValue}%`
                        : `Giảm ${new Intl.NumberFormat("vi-VN").format(discountData.discountValue)}₫`
                      : `+${discountData.extraDays} ngày Premium miễn phí`}
                  </span>
                </div>
              </div>
            )}
          </div>

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
                    {discountData && isDiscountApplicable(plan)
                      ? formatPrice(getDiscountedPrice(plan))
                      : formatPrice(plan.price)}
                  </span>
                  {plan.duration && (
                    <span className="pricing-period">/{plan.duration}</span>
                  )}
                </div>

                {/* Show original price with strikethrough when discount is applied */}
                {discountData && isDiscountApplicable(plan) && discountData.type === "price_reduction" && getDiscountedPrice(plan) < plan.price && (
                  <div className="pricing-original-price">
                    <span className="pricing-strikethrough">
                      ₫{formatPrice(plan.price)}
                    </span>
                    <span className="pricing-discount-tag">
                      -{discountData.discountMethod === "percentage"
                        ? `${discountData.discountValue}%`
                        : `${formatPrice(discountData.discountValue)}₫`}
                    </span>
                  </div>
                )}

                {/* Show extra days badge for time_extension discount */}
                {discountData && isDiscountApplicable(plan) && discountData.type === "time_extension" && (
                  <div className="pricing-extra-days-badge">
                    🎁 +{discountData.extraDays} ngày miễn phí
                  </div>
                )}

                {/* Show original price when no discount or discount not applicable */}
                {(!discountData || !isDiscountApplicable(plan)) && plan.originalPrice && plan.originalPrice !== plan.price && (
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

      {/* Pending Payment Popup */}
      {showPendingPopup && (
        <div className="pending-popup-overlay" onClick={() => setShowPendingPopup(false)}>
          <div className="pending-popup" onClick={(e) => e.stopPropagation()}>
            <img src={HappyImg} alt="Happy" className="pending-popup-logo" />
            <h3 className="pending-popup-title">Yêu cầu đang được xử lý!</h3>
            <p className="pending-popup-message">
              Bạn đã có một yêu cầu nâng cấp Premium đang chờ xử lý.<br />
              Vui lòng chờ admin duyệt yêu cầu trước của bạn nhé! 🌟
            </p>
            <button
              className="pending-popup-btn"
              onClick={() => setShowPendingPopup(false)}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
