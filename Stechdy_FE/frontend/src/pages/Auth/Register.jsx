import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthInput from "../../components/common/AuthInput";
import AuthButton from "../../components/common/AuthButton";
import { register, googleLogin } from "../../services/authService";
import "./Register.css";

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "944831618827-2qgcaei2lpcko6ucl9lj9m21llvkj7nn.apps.googleusercontent.com";

const Register = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
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

    if (!formData.name) {
      newErrors.name = t("auth.validation.nameRequired");
    } else if (formData.name.length < 2) {
      newErrors.name = t("auth.validation.nameMinLength");
    }

    if (!formData.email) {
      newErrors.email = t("auth.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("auth.validation.emailInvalid");
    }

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
      const response = await register(
        formData.name,
        formData.email,
        formData.password
      );

      if (response.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(response.data));

        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      setApiError(error.message || t("auth.register.registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      setLoading(true);
      setApiError("");

      const response = await googleLogin(credentialResponse.credential);

      if (response.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(response.data));

        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      setApiError(error.message || t("auth.register.googleSignupFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError(t("auth.register.googleSignupFailed"));
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthLayout>
        <div className="register-header">
          <h1 className="auth-title">{t("auth.register.title")}</h1>
          <h2 className="auth-brand">S'techdy</h2>
          <p className="auth-subtitle">{t("auth.register.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <div className="form-group">
            <label className="form-label">{t("auth.register.fullName")}</label>
            <AuthInput
              type="text"
              name="name"
              placeholder={t("auth.register.fullName")}
              value={formData.name}
              onChange={handleChange}
              icon="👤"
              error={errors.name}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("auth.register.email")}</label>
            <AuthInput
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              icon="📧"
              error={errors.email}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("auth.register.password")}</label>
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
              {t("auth.register.confirmPassword")}
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
            {t("auth.register.submit")}
          </AuthButton>

          <div className="divider">
            <span>{t("auth.register.orContinueWith")}</span>
          </div>

          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              locale={i18n.language}
              width="100%"
            />
          </div>

          <div className="login-link">
            {t("auth.register.haveAccount")}{" "}
            <Link to="/login">{t("auth.register.loginNow")}</Link>
          </div>
        </form>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
};

export default Register;
