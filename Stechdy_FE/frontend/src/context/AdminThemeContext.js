import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};

export const AdminThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark' for admin
    return localStorage.getItem('admin-theme') || 'dark';
  });

  useEffect(() => {
    // Apply theme to document root
    console.log('Admin theme changed to:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    setTheme
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};