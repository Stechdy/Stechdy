import React from 'react';
import './AuthInput.css';

const AuthInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon,
  error,
  name,
  showPassword,
  onTogglePassword
}) => {
  return (
    <div className="auth-input-wrapper">
      <div className={`auth-input-container ${error ? 'error' : ''}`}>
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="auth-input"
          name={name}
        />
        {type === 'password' && onTogglePassword && (
          <button 
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && <span className="auth-input-error">{error}</span>}
    </div>
  );
};

export default AuthInput;
