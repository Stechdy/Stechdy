import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children, title, subtitle, showWelcome = false }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <div className="logo-icon">
            🎓
          </div>
        </div>
        
        <div className="auth-header">
          {showWelcome && <h1 className="auth-title">Welcome back to</h1>}
          <h2 className="auth-brand">S'techdy</h2>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        <div className="auth-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
