import React, { useState, useEffect } from "react";
import { refreshUserData } from "../../services/authService";
import "./PremiumBanner.css";

const PremiumBanner = () => {
  const [show, setShow] = useState(false);
  const [premiumData, setPremiumData] = useState(null);

  useEffect(() => {
    // Refresh user data from server first, then check premium status
    const checkStatus = async () => {
      await refreshUserData();
      checkPremiumStatus();
    };
    checkStatus();
  }, []);

  const checkPremiumStatus = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (user?.premiumStatus === "premium" && user?.premiumExpiryDate) {
      const expiryDate = new Date(user.premiumExpiryDate);
      const now = new Date();
      
      // Check if premium is still valid
      if (expiryDate > now) {
        // Check if user has seen the welcome banner before
        const hasSeenWelcome = localStorage.getItem("premiumWelcomeBannerSeen");
        
        // Only show once - first time after becoming premium
        if (!hasSeenWelcome) {
          setPremiumData({
            expiryDate: expiryDate.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          });
          setShow(true);
        }
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    // Mark as seen permanently - will only show once per user
    localStorage.setItem("premiumWelcomeBannerSeen", "true");
  };

  if (!show || !premiumData) return null;

  return (
    <div className="premium-banner-overlay" onClick={handleClose}>
      <div className="premium-banner" onClick={(e) => e.stopPropagation()}>
        <button className="premium-banner-close" onClick={handleClose}>
          ✕
        </button>
        
        <div className="premium-banner-icon">👑</div>
        
        <h2 className="premium-banner-title">
          Chúc mừng! Bạn đã là Premium! 🎉
        </h2>
        
        <p className="premium-banner-message">
          Cảm ơn bạn đã nâng cấp lên Stechdy Premium! Bạn có thể sử dụng tất cả
          các tính năng cao cấp của chúng tôi.
        </p>
        
        <div className="premium-banner-expiry">
          <span className="expiry-label">Thời hạn đến:</span>
          <span className="expiry-date">{premiumData.expiryDate}</span>
        </div>
        
        <div className="premium-features">
          <h4>Các tính năng Premium của bạn:</h4>
          <ul>
            <li>✅ Phân tích học tập nâng cao với AI</li>
            <li>✅ Mục tiêu cá nhân hoá không giới hạn</li>
            <li>✅ Xuất dữ liệu học tập</li>
            <li>✅ Hỗ trợ ưu tiên 24/7</li>
            <li>✅ Chủ đề và giao diện tuỳ chỉnh</li>
          </ul>
        </div>
        
        <button className="premium-banner-btn" onClick={handleClose}>
          Bắt đầu trải nghiệm
        </button>
      </div>
    </div>
  );
};

export default PremiumBanner;
