import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moodService from "../../services/moodService";
import "./SidebarNav.css";

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [hasTodayMood, setHasTodayMood] = useState(false);
  const itemRefs = useRef([]);
  
  // Get the current active index based on route
  const getCurrentIndex = () => {
    const pathname = location.pathname;
    
    // Check for mood routes (including /mood/history)
    if (pathname === "/mood" || pathname === "/mood/history") return 3;
    
    // Check for account routes (including all sub-pages)
    if (pathname.startsWith("/account") || 
        pathname === "/profile" || 
        pathname === "/notification-settings" ||
        pathname === "/help" ||
        pathname === "/about" ||
        pathname === "/terms" ||
        pathname === "/user-information") return 4;
    
    // Check for dashboard
    if (pathname === "/dashboard") return 0;
    
    // Check for calendar
    if (pathname === "/calendar") return 1;
    
    // Check for AI
    if (pathname === "/ai") return 2;
    
    return 0; // Default to dashboard
  };

  const [activeIndex, setActiveIndex] = useState(getCurrentIndex());

  useEffect(() => {
    checkTodayMood();
  }, []);

  // Update activeIndex when route changes
  useEffect(() => {
    const newIndex = getCurrentIndex();
    setActiveIndex(newIndex);
  }, [location.pathname]);

  const checkTodayMood = async () => {
    try {
      const response = await moodService.getTodayMood();
      setHasTodayMood(response.success && response.data);
    } catch (error) {
      console.error("Error checking today mood:", error);
      setHasTodayMood(false);
    }
  };

  const handleMoodClick = () => {
    if (hasTodayMood) {
      navigate("/mood/history");
    } else {
      navigate("/mood");
    }
  };

  const handleNavClick = (item, index) => {
    // Set active index immediately for smooth animation
    setActiveIndex(index);

    // Navigate after animation starts
    setTimeout(() => {
      if (item.path === "/mood") {
        handleMoodClick();
      } else {
        navigate(item.path);
      }
    }, 150);
  };

  const isActive = (path) => {
    const pathname = location.pathname;
    
    // Check for exact match
    if (pathname === path) {
      return true;
    }
    
    // Check for mood paths
    if (path === "/mood" && (pathname === "/mood" || pathname === "/mood/history")) {
      return true;
    }
    
    // Check for account and all its sub-pages
    if (path === "/account" && (
      pathname.startsWith("/account") || 
      pathname === "/profile" || 
      pathname === "/notification-settings" ||
      pathname === "/help" ||
      pathname === "/about" ||
      pathname === "/terms" ||
      pathname === "/user-information"
    )) {
      return true;
    }
    
    return false;
  };

  // Calculate position for each item based on distance from active
  const getItemStyle = (index) => {
    const distance = index - activeIndex;
    const verticalSpacing = 55; // Vertical space between items
    
    // Calculate vertical position only (no curve)
    const yOffset = distance * verticalSpacing;
    
    // Scale based on distance (center is bigger)
    const scale = distance === 0 ? 1.15 : Math.max(0.75, 1 - Math.abs(distance) * 0.12);
    
    // Opacity based on distance
    const opacity = distance === 0 ? 1 : Math.max(0.6, 1 - Math.abs(distance) * 0.15);
    
    return {
      transform: `translateY(${yOffset}px) scale(${scale})`,
      opacity,
      zIndex: 10 - Math.abs(distance),
    };
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      labelKey: "sidebarNav.dashboard",
    },
    {
      path: "/calendar",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      ),
      labelKey: "sidebarNav.calendar",
    },
    {
      path: "/ai",
      icon: (
        <div className="ai-fab">
          <img 
            src={require("../../assets/STECHDY.webp")} 
            alt="S'Techdy AI" 
            style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '18px' }}
          />
        </div>
      ),
      labelKey: "sidebarNav.ai",
    },
    {
      path: "/mood",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
        </svg>
      ),
      labelKey: "sidebarNav.mood",
    },
    {
      path: "/account",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      labelKey: "sidebarNav.account",
    },
  ];

  return (
    <>
      {/* Sidebar navigation - Curved carousel */}
      <nav className="sidebar-nav">
        <div className="sidebar-content">
          {navItems.map((item, index) => (
            <button
              key={item.path}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              onClick={() => handleNavClick(item, index)}
              style={getItemStyle(index)}
            >
              <div className="nav-item-icon">
                {item.icon}
              </div>
              <span className="nav-item-label">{t(item.labelKey)}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default SidebarNav;
