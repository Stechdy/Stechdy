import api from './api';

const notificationService = {
  // Get all notifications
  getNotifications: async (unreadOnly = false) => {
    const token = localStorage.getItem('token');
    return await api.get(`/notifications?unreadOnly=${unreadOnly}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const token = localStorage.getItem('token');
    return await api.put(`/notifications/${id}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Mark all as read
  markAllAsRead: async () => {
    const token = localStorage.getItem('token');
    return await api.put('/notifications/read-all', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Delete notification
  deleteNotification: async (id) => {
    const token = localStorage.getItem('token');
    return await api.delete(`/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Test mood reminder (for development)
  testMoodReminder: async () => {
    const token = localStorage.getItem('token');
    return await api.post('/notifications/test-mood-reminder', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default notificationService;
