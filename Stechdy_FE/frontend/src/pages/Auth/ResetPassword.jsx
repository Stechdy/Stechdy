import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthInput from "../../components/common/AuthInput";
import AuthButton from "../../components/common/AuthButton";
import { resetPassword } from "../../services/authService";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { t } = useTranslation();
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.validation.passwordMinLength");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const response = await resetPassword(resetToken, formData.password);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setApiError(error.message || t("auth.resetPassword.failed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>{t("auth.resetPassword.success")}</h2>
          <p>{t("auth.resetPassword.successMessage")}</p>
          <AuthButton onClick={() => navigate("/login")}>
            {t("auth.resetPassword.goToLogin")}
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="reset-password-header">
        <h1 className="auth-title">{t("auth.resetPassword.title")}</h1>
        <h2 className="auth-brand">S'techdy</h2>
        <p className="auth-subtitle">{t("auth.resetPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="reset-password-form">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="form-group">
          <label className="form-label">
            {t("auth.resetPassword.newPassword")}
          </label>
          <AuthInput
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            icon="🔒"
            error={errors.password}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {t("auth.resetPassword.confirmNewPassword")}
          </label>
          <AuthInput
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon="🔒"
            error={errors.confirmPassword}
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />
        </div>

        <AuthButton type="submit" loading={loading} disabled={loading}>
          {t("auth.resetPassword.submit")}
        </AuthButton>

        <div className="back-to-login">
          <Link to="/login">← {t("auth.resetPassword.backToLogin")}</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
