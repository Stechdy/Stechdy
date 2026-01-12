import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthInput from "../../components/common/AuthInput";
import AuthButton from "../../components/common/AuthButton";
import { forgotPassword } from "../../services/authService";
import "./AdminForgotPassword.css";

const AdminForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      setError(err.message || t("auth.admin.forgotPassword.failed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="admin-badge">
          <span>🛡️ {t("auth.admin.badge")}</span>
        </div>

        <div className="success-message">
          <div className="success-icon">✉️</div>
          <h2>{t("auth.admin.forgotPassword.checkEmail")}</h2>
          <p>
            {t("auth.admin.forgotPassword.emailSent")} <strong>{email}</strong>.
          </p>
          <p className="note">{t("auth.admin.forgotPassword.checkSpam")}</p>
          <AuthButton onClick={() => navigate("/admin/login")}>
            {t("auth.admin.forgotPassword.backToLogin")}
          </AuthButton>
          <div className="resend-link">
            <button onClick={() => setSuccess(false)} className="link-button">
              {t("auth.admin.forgotPassword.tryAnotherEmail")}
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="admin-badge">
        <span>🛡️ {t("auth.admin.badge")}</span>
      </div>

      <div className="admin-forgot-header">
        <h1 className="auth-title">{t("auth.admin.forgotPassword.title")}</h1>
        <h2 className="auth-brand">S'techdy</h2>
        <p className="auth-subtitle">
          {t("auth.admin.forgotPassword.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="admin-forgot-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">
            {t("auth.admin.forgotPassword.adminEmail")}
          </label>
          <AuthInput
            type="email"
            name="email"
            placeholder="admin@stechdy.com"
            value={email}
            onChange={handleChange}
            icon="📧"
            error={error}
          />
        </div>

        <AuthButton type="submit" loading={loading} disabled={loading}>
          {t("auth.admin.forgotPassword.submit")}
        </AuthButton>

        <div className="back-to-login">
          <Link to="/admin/login">
            ← {t("auth.admin.forgotPassword.backToLogin")}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminForgotPassword;
