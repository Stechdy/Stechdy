import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PaymentModal.css";

const PaymentModal = ({ isOpen, onClose, planData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && planData) {
      // Reset states when modal opens
      setSubmitted(false);
      setError("");
      setPaymentInfo(null);
      createPaymentRequest();
    }
  }, [isOpen, planData]);

  const createPaymentRequest = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:3001/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: planData.id,
          planName: planData.name,
          amount: planData.price,
        }),
      });

      const data = await response.json();
      console.log("Create payment response:", response.status, data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment request");
      }

      setPaymentInfo(data.payment);
      console.log("Payment info set:", data.payment);
    } catch (err) {
      console.error("Error creating payment request:", err);
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      console.log("Submitting payment with ID:", paymentInfo.id);
      
      const response = await fetch("http://localhost:3001/api/payments/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: paymentInfo.id,
        }),
      });

      const data = await response.json();
      console.log("Submit response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit payment");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting payment:", err);
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {loading && !paymentInfo ? (
          <div className="payment-loading">
            <div className="spinner"></div>
            <p>Đang tạo yêu cầu thanh toán...</p>
          </div>
        ) : submitted ? (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Xác nhận đã gửi!</h2>
            <p>Vui lòng chờ 3-10 phút để admin duyệt thanh toán của bạn.</p>
            <p className="success-note">
              Bạn sẽ nhận được email xác nhận khi thanh toán được duyệt.
            </p>
            <button className="payment-btn payment-btn-primary" onClick={onClose}>
              Đóng
            </button>
          </div>
        ) : paymentInfo ? (
          <div className="payment-content">
            <h2 className="payment-title">Thanh toán {planData.name}</h2>

            <div className="payment-amount-box">
              <span className="payment-amount-label">Số tiền thanh toán:</span>
              <span className="payment-amount">{formatAmount(paymentInfo.amount)}₫</span>
            </div>

            <div className="payment-qr-section">
              <h3>Quét mã QR để chuyển khoản</h3>
              <div className="qr-code-container">
                <img src="/QRCode.jpg" alt="QR Code" className="qr-code" />
              </div>
            </div>

            <div className="payment-info-section">
              <h3>Thông tin chuyển khoản</h3>
              <div className="payment-info-list">
                <div className="payment-info-item">
                  <span className="info-label">Ngân hàng:</span>
                  <span className="info-value">
                    {paymentInfo.bankInfo.bankName}
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentInfo.bankInfo.bankName)}
                      title="Copy"
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="payment-info-item">
                  <span className="info-label">Số tài khoản:</span>
                  <span className="info-value">
                    {paymentInfo.bankInfo.accountNumber}
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentInfo.bankInfo.accountNumber)}
                      title="Copy"
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="payment-info-item">
                  <span className="info-label">Tên tài khoản:</span>
                  <span className="info-value">
                    {paymentInfo.bankInfo.accountName}
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentInfo.bankInfo.accountName)}
                      title="Copy"
                    >
                      📋
                    </button>
                  </span>
                </div>
                <div className="payment-info-item highlight">
                  <span className="info-label">Mã thanh toán:</span>
                  <span className="info-value payment-code">
                    {paymentInfo.paymentCode}
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(paymentInfo.paymentCode)}
                      title="Copy"
                    >
                      📋
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="payment-note">
              <div className="note-icon">⚠️</div>
              <div className="note-content">
                <strong>Lưu ý quan trọng:</strong>
                <p>
                  Vui lòng ghi <strong>ĐÚNG MÃ {paymentInfo.paymentCode}</strong> vào nội
                  dung chuyển khoản để hoàn tất thanh toán.
                </p>
              </div>
            </div>

            {error && <div className="payment-error">{error}</div>}

            <div className="payment-actions">
              <button
                className="payment-btn payment-btn-primary"
                onClick={handleSubmitPayment}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Tôi đã hoàn tất thanh toán"}
              </button>
              <button className="payment-btn payment-btn-secondary" onClick={onClose}>
                Hủy
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentModal;
