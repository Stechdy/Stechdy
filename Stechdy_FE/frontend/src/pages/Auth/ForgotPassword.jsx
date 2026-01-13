import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthInput from "../../components/common/AuthInput";
import AuthButton from "../../components/common/AuthButton";
import { forgotPassword } from "../../services/authService";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  const validateEmail = () => {
    if (!email) {
      setError(t("auth.validation.emailRequired"));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t("auth.validation.emailInvalid"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await forgotPassword(email);

      if (response.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || t("auth.forgotPassword.submit"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="success-message">
          <div className="success-icon">✉️</div>
          <h2>{t("auth.forgotPassword.checkEmail")}</h2>
          <p>
            {t("auth.forgotPassword.emailSent")} <strong>{email}</strong>
          </p>
          <p className="note">{t("auth.forgotPassword.checkSpam")}</p>
          <AuthButton onClick={() => navigate("/login")}>
            {t("auth.forgotPassword.backToLogin")}
          </AuthButton>
          <div className="resend-link">
            <button onClick={() => setSuccess(false)} className="link-button">
              {t("auth.forgotPassword.tryAnotherEmail")}
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="forgot-password-header">
        <h1 className="auth-title">{t("auth.forgotPassword.title")}</h1>
        <p className="auth-subtitle">{t("auth.forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">{t("auth.forgotPassword.email")}</label>
          <AuthInput
            type="email"
            name="email"
            placeholder="email@example.com"
            value={email}
            onChange={handleChange}
            icon="📧"
            error={error}
          />
        </div>

        <AuthButton type="submit" loading={loading} disabled={loading}>
          {t("auth.forgotPassword.submit")}
        </AuthButton>

        <div className="back-to-login">
          <Link to="/login">{t("auth.forgotPassword.backToLogin")}</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
