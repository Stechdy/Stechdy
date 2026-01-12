const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Register
export const register = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Forgot Password
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Reset Password
export const resetPassword = async (resetToken, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getMe = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user data');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Call logout endpoint to clear refresh token on server
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Refresh Access Token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }

    // Update tokens in localStorage
    if (data.data.token) {
      localStorage.setItem('token', data.data.token);
    }
    if (data.data.refreshToken) {
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }

    return data;
  } catch (error) {
    // If refresh fails, logout user
    logout();
    throw error;
  }
};

// Change Password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get user role
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.role || null;
};

// Google Login
export const googleLogin = async (credential) => {
  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Google login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Refresh user data from server (to get latest premium status)
export const refreshUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update local storage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return null;
  }
};
