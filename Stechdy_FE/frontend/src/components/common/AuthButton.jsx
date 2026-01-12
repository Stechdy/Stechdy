import React from 'react';
import './AuthButton.css';

const AuthButton = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`auth-button ${variant} ${fullWidth ? 'full-width' : ''}`}
    >
      {loading ? (
        <span className="loading-spinner"></span>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default AuthButton;
