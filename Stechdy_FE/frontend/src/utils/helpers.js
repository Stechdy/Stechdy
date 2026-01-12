// Helper functions

// Get current date/time in Vietnam timezone (UTC+7)
export const getVietnamTime = () => {
  const now = new Date();
  // Get time in Vietnam timezone
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Vietnam is UTC+7
  const vietnamTime = new Date(utcTime + (7 * 3600000));
  return vietnamTime;
};

// Get Vietnam date at start of day (00:00:00)
export const getVietnamDate = () => {
  const vietnamTime = getVietnamTime();
  vietnamTime.setHours(0, 0, 0, 0);
  return vietnamTime;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
