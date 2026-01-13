import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthInput from "../../components/common/AuthInput";
import AuthButton from "../../components/common/AuthButton";
import { login } from "../../services/authService";
import "./AdminLogin.css";

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin/dashboard";
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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

    if (!formData.email) {
      newErrors.email = t("auth.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("auth.validation.passwordRequired");
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
      const response = await login(formData.email, formData.password);

      if (response.success) {
        // Check if user is admin
        if (
          response.data.role !== "admin" &&
          response.data.role !== "moderator"
        ) {
          setApiError(t("auth.admin.login.accessDenied"));
          setLoading(false);
          return;
        }

        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));

        // Redirect to intended page or admin dashboard
        navigate(from, { replace: true });
      }
    } catch (error) {
      setApiError(error.message || t("auth.admin.login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="admin-badge">
        <span>🛡️ {t("auth.admin.badge")}</span>
      </div>

      <div className="admin-login-header">
        <h1 className="auth-title">{t("auth.admin.login.title")}</h1>
        <p className="auth-subtitle">{t("auth.admin.login.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="admin-login-form">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="form-group">
          <label className="form-label">
            {t("auth.admin.login.adminEmail")}
          </label>
          <AuthInput
            type="email"
            name="email"
            placeholder="admin@stechdy.com"
            value={formData.email}
            onChange={handleChange}
            icon="👤"
            error={errors.email}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t("auth.admin.login.password")}</label>
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

        <div className="forgot-password-link">
          <Link to="/admin/forgot-password">
            {t("auth.admin.login.forgotPassword")}
          </Link>
        </div>

        <AuthButton type="submit" loading={loading} disabled={loading}>
          {t("auth.admin.login.submit")}
        </AuthButton>

        <div className="user-portal-link">
          <Link to="/login">← {t("auth.admin.login.backToUser")}</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
