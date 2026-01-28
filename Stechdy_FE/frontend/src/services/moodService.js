import api from './api';

const moodService = {
  // Create or update today's mood entry
  createMoodEntry: async (moodData) => {
    const token = localStorage.getItem('token');
    return await api.post('/moods', moodData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get all mood entries
  getMoodEntries: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/moods${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get today's mood
  getTodayMood: async () => {
    const token = localStorage.getItem('token');
    return await api.get('/moods/today', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get mood by specific date
  getMoodByDate: async (date) => {
    const token = localStorage.getItem('token');
    return await api.get(`/moods/date/${date}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get mood statistics
  getMoodStats: async (days = 30) => {
    const token = localStorage.getItem('token');
    return await api.get(`/moods/stats?days=${days}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Delete mood entry
  deleteMoodEntry: async (id) => {
    const token = localStorage.getItem('token');
    return await api.delete(`/moods/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Generate AI insight
  generateInsight: async (id) => {
    const token = localStorage.getItem('token');
    return await api.post(`/moods/${id}/insight`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Makeup mood check-in
  makeupMoodCheckIn: async (moodData) => {
    const token = localStorage.getItem('token');
    return await api.post('/moods/makeup', moodData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Get streak info with milestones
  getStreakInfo: async () => {
    const token = localStorage.getItem('token');
    return await api.get('/moods/streak', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default moodService;
