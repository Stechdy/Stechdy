import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BottomNav from "../../components/common/BottomNav";
import SidebarNav from "../../components/common/SidebarNav";
import "./UserInformation.css";

const UserInformation = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

  // Helper function to handle API errors
  const handleApiError = (error, response = null) => {
    let errorMessage = "An unexpected error occurred";

    if (error.name === "AbortError" || error.message.includes("timeout")) {
      errorMessage = "Request Timeout";
    } else if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      errorMessage = "Network error. Please check your connection.";
    } else if (response) {
      switch (response.status) {
        case 400:
          errorMessage = "Bad request. Please check your input.";
          break;
        case 401:
          errorMessage = "Unauthorized. Please login again.";
          break;
        case 403:
          errorMessage = "Access denied.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 408:
          errorMessage = "Request Timeout";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        case 503:
          errorMessage = "Service unavailable. Please try again later.";
          break;
        default:
          errorMessage = error.message || `Error: ${response.status}`;
      }
    } else {
      errorMessage = error.message || errorMessage;
    }

    return errorMessage;
  };

  // Helper function to fetch with timeout
  const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeout)
      ),
    ]);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetchWithTimeout(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = handleApiError(new Error(), response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUserData(data);
      setEditData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        timezone: data.timezone || "UTC",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      const errorMessage = handleApiError(err);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });

      // Fallback to stored user data
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUserData(storedUser);
      setEditData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        phone: storedUser.phone || "",
        bio: storedUser.bio || "",
        timezone: storedUser.timezone || "UTC",
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetchWithTimeout(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorMessage = handleApiError(new Error(), response);
        throw new Error(errorMessage);
      }

      const updatedData = await response.json();
      setUserData((prev) => ({ ...prev, ...updatedData }));

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, ...editData })
      );

      toast.success(t("userInfo.profileUpdated"), {
        position: "top-center",
        autoClose: 3000,
      });
      setIsEditing(false);
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      bio: userData?.bio || "",
      timezone: userData?.timezone || "UTC",
    });
    setIsEditing(false);
  };

  // Avatar upload handlers
  const handleAvatarClick = () => {
    setShowAvatarMenu(!showAvatarMenu);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
    setShowAvatarMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("userInfo.avatar.invalidType"), {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("userInfo.avatar.fileTooLarge"), {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetchWithTimeout(
        `${API_URL}/upload/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
        15000
      ); // Longer timeout for file upload

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        if (!response.ok) {
          throw new Error(handleApiError(new Error(), response));
        }
        throw parseError;
      }

      if (!response.ok) {
        throw new Error(data.message || handleApiError(new Error(), response));
      }

      // Update user data with new avatar URL
      setUserData((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, avatarUrl: data.avatarUrl })
      );

      toast.success(t("userInfo.avatar.uploadSuccess"), {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setShowAvatarMenu(false);

    if (!userData?.avatarUrl) {
      toast.error(t("userInfo.avatar.noAvatar"), {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetchWithTimeout(`${API_URL}/upload/avatar`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        if (!response.ok) {
          throw new Error(handleApiError(new Error(), response));
        }
        throw parseError;
      }

      if (!response.ok) {
        throw new Error(data.message || handleApiError(new Error(), response));
      }

      // Update user data - remove avatar URL
      setUserData((prev) => ({ ...prev, avatarUrl: null }));

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, avatarUrl: null })
      );

      toast.success(t("userInfo.avatar.deleteSuccess"), {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAvatarMenu && !event.target.closest(".avatar-wrapper")) {
        setShowAvatarMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showAvatarMenu]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(
      i18n.language === "vi" ? "vi-VN" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getPlanLabel = (status) => {
    return status === "premium" || status === "active"
      ? t("account.premiumPlan")
      : t("account.freePlan");
  };

  if (loading) {
    return (
      <div className="user-info-page">
        <SidebarNav />
        <div className="user-info-wrapper">
          <div className="user-info-content">
            <div className="user-info-loading">
              <div className="loading-spinner"></div>
              <p>{t("userInfo.loading")}</p>
            </div>
          </div>
          <BottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-page">
      <SidebarNav />
      <ToastContainer />
      <div className="user-info-wrapper">
        <div className="user-info-content">
        {/* Page Title */}
        <div className="user-info-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="user-info-page-title">{t("userInfo.title")}</h1>
        </div>

        {/* Profile Card */}
        <div className="profile-info-card">
          <div className="avatar-wrapper">
            {uploadingAvatar && (
              <div className="avatar-upload-overlay">
                <div className="avatar-upload-spinner"></div>
              </div>
            )}
            <img
              src={userData?.avatarUrl || require("../../assets/STECHDY.webp")}
              alt="Profile"
              className="profile-avatar"
            />
            <button
              className="edit-avatar-btn"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
            />

            {/* Avatar menu dropdown */}
            {showAvatarMenu && (
              <div className="avatar-menu">
                <button className="avatar-menu-item" onClick={handleFileSelect}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 8L12 3L7 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{t("userInfo.avatar.upload")}</span>
                </button>
                {userData?.avatarUrl && (
                  <button
                    className="avatar-menu-item avatar-menu-item-danger"
                    onClick={handleRemoveAvatar}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6H5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{t("userInfo.avatar.remove")}</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="profile-name-section">
            <h2 className="profile-display-name">{userData?.name || "User"}</h2>
            <span className="profile-plan-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z"
                  fill="currentColor"
                />
              </svg>
              {getPlanLabel(userData?.premiumStatus)}
            </span>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="info-section-card">
          <div className="section-header">
            <h3 className="card-section-title">{t("userInfo.personalInfo")}</h3>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("userInfo.edit")}
              </button>
            ) : (
              <div className="edit-actions">
                <button className="cancel-btn" onClick={handleCancel}>
                  {t("userInfo.cancel")}
                </button>
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? t("userInfo.saving") : t("userInfo.save")}
                </button>
              </div>
            )}
          </div>

          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">{t("userInfo.name")}</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder={t("userInfo.name")}
                  />
                ) : (
                  <span className="info-value">
                    {userData?.name || t("userInfo.notSet")}
                  </span>
                )}
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6L12 13L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">{t("userInfo.email")}</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder={t("userInfo.email")}
                  />
                ) : (
                  <span className="info-value">
                    {userData?.email || t("userInfo.notSet")}
                  </span>
                )}
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6408 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77383 17.3147 6.72534 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27099 2.12 4.18C2.09501 3.90347 2.12788 3.62476 2.21651 3.36162C2.30513 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04982 2.28271 3.30379 2.17052C3.55777 2.05833 3.83234 2.00026 4.11 2H7.11C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04208 3.23945 9.11 3.72C9.23662 4.68007 9.47145 5.62273 9.81 6.53C9.94455 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0554 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">{t("userInfo.phone")}</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="info-input"
                    placeholder={t("userInfo.phone")}
                  />
                ) : (
                  <span className="info-value">
                    {userData?.phone || t("userInfo.notSet")}
                  </span>
                )}
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 13H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 9H9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">{t("userInfo.bio")}</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={editData.bio}
                    onChange={handleInputChange}
                    className="info-textarea"
                    placeholder={t("userInfo.bioPlaceholder")}
                    rows="3"
                  />
                ) : (
                  <span className="info-value">
                    {userData?.bio || t("userInfo.noBio")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="info-section-card">
          <h3 className="card-section-title">{t("userInfo.accountDetails")}</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon status-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4L12 14.01L9 11.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">
                  {t("userInfo.accountStatus")}
                </label>
                <span className="info-value status-active">
                  {t("userInfo.active")}
                </span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 10H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">
                  {t("userInfo.memberSince")}
                </label>
                <span className="info-value">
                  {formatDate(userData?.joinedAt)}
                </span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon level-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">{t("userInfo.level")}</label>
                <span className="info-value">
                  {t("userInfo.levelValue", {
                    level: userData?.level || 1,
                    xp: userData?.xp || 0,
                  })}
                </span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon streak-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="info-content">
                <label className="info-label">
                  {t("userInfo.currentStreak")}
                </label>
                <span className="info-value">
                  {t("userInfo.streakDays", {
                    days: userData?.streakCount || 0,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default UserInformation;
