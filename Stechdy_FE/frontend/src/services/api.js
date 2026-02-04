// API service configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
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

  if (data.data.token) {
    localStorage.setItem('token', data.data.token);
  }
  if (data.data.refreshToken) {
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }

  return data.data.token;
};

const handleRequest = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();

  // Check if token expired (401 Unauthorized)
  if (response.status === 401 && data.message && data.message.toLowerCase().includes('token')) {
    if (isRefreshing) {
      // Wait for the token to be refreshed
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        options.headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, options).then(res => res.json());
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      
      // Retry original request with new token
      options.headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, options);
      return await retryResponse.json();
    } catch (error) {
      processQueue(error, null);
      
      // If refresh fails, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  return data;
};

const apiService = {
  get: async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const fetchOptions = {
        method: 'GET',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
      return await handleRequest(url, fetchOptions);
    } catch (error) {
      throw error;
    }
  },

  post: async (endpoint, data, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const fetchOptions = {
        method: 'POST',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      };
      return await handleRequest(url, fetchOptions);
    } catch (error) {
      throw error;
    }
  },

  put: async (endpoint, data, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const fetchOptions = {
        method: 'PUT',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      };
      return await handleRequest(url, fetchOptions);
    } catch (error) {
      throw error;
    }
  },

  delete: async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const fetchOptions = {
        method: 'DELETE',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
      return await handleRequest(url, fetchOptions);
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;
