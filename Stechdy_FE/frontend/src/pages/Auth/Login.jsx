import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthInput from "../../components/common/AuthInput";
import AuthButton from "../../components/common/AuthButton";
import { login, googleLogin } from "../../services/authService";
import "./Login.css";

const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "335161050092-sncgi0nc2tg95sahqvukc41jre2aac9o.apps.googleusercontent.com";

const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const googleButtonRef = useRef(null);
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
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(response.data));

        // Redirect based on role
        if (response.data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setApiError(error.message || t("auth.login.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
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

        // Redirect based on role
        if (response.data.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setApiError(error.message || t("auth.login.googleLoginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setApiError(t("auth.login.googleLoginFailed"));
  };

  const handleCustomGoogleButtonClick = () => {
    // Trigger click on hidden Google button
    if (googleButtonRef.current) {
      const googleButton = googleButtonRef.current.querySelector('div[role="button"]');
      if (googleButton) {
        googleButton.click();
      }
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthLayout showWelcome={true}>
        <form onSubmit={handleSubmit} className="login-form">
          {apiError && <div className="alert alert-error">{apiError}</div>}

          <div className="form-group">
            <label className="form-label">{t("auth.login.email")}</label>
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
            <label className="form-label">{t("auth.login.password")}</label>
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
            <Link to="/forgot-password">{t("auth.login.forgotPassword")}</Link>
          </div>

          <AuthButton type="submit" loading={loading} disabled={loading}>
            {t("auth.login.submit")}
          </AuthButton>

          <div className="login-divider">
            <span>{t("auth.login.orContinueWith")}</span>
          </div>

          {/* Custom Google Button with gradient style */}
          <AuthButton
            type="button"
            variant="google"
            onClick={handleCustomGoogleButtonClick}
            disabled={loading}
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
            }
          >
            {t("auth.login.googleSignIn")}
          </AuthButton>

          {/* Hidden Google Login Component */}
          <div
            ref={googleButtonRef}
            className="google-login-hidden"
            style={{ display: 'none' }}
          >
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              locale={i18n.language}
              auto_select={false}
              use_fedcm_for_prompt={false}
            />
          </div>

          <div className="signup-link">
            {t("auth.login.noAccount")}{" "}
            <Link to="/register">{t("auth.login.signUpNow")}</Link>
          </div>
        </form>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
};

export default Login;
