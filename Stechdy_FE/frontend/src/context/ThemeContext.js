import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const ThemeContext = createContext();

// Theme modes: 'light', 'dark', 'system'
const THEME_KEY = "stechdy-theme-mode";

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'system'
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved || "system";
    } catch {
      return "system";
    }
  });

  // Get system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }, []);

  // Actual theme being applied (light or dark) - initialize with system preference
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved && saved !== "system") {
        return saved;
      }
      // Auto-detect from system preference
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return "light";
    } catch {
      return "light";
    }
  });

  // Resolve the actual theme based on mode
  const resolveTheme = useCallback(
    (mode) => {
      if (mode === "system") {
        return getSystemTheme();
      }
      return mode;
    },
    [getSystemTheme]
  );

  // Apply theme to document
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Also update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#1F1F1F" : "#F5F7FA"
      );
    }
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    const resolved = resolveTheme(themeMode);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Save to localStorage
    try {
      localStorage.setItem(THEME_KEY, themeMode);
    } catch (error) {
    }
  }, [themeMode, resolveTheme, applyTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [themeMode, applyTheme]);

  // Apply theme on initial mount
  useEffect(() => {
    const resolved = resolveTheme(themeMode);
    applyTheme(resolved);
  }, []);

  const value = {
    themeMode, // Current mode setting: 'light', 'dark', or 'system'
    resolvedTheme, // Actual theme being displayed: 'light' or 'dark'
    setThemeMode, // Function to change the theme mode
    isDark: resolvedTheme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
