import api from './api';

const settingsService = {
  // Get user settings
  getSettings: async () => {
    try {
      const response = await api.get('/users/settings');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        success: false,
        message: error.message || 'Failed to load settings',
      };
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/users/settings', settings);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return {
        success: false,
        message: error.message || 'Failed to update settings',
      };
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await api.put('/user/settings/notifications', preferences);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return {
        success: false,
        message: error.message || 'Failed to update notification preferences',
      };
    }
  },

  // Update sound preferences
  updateSoundPreferences: async (soundPrefs) => {
    try {
      const response = await api.put('/user/settings/sound', soundPrefs);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating sound preferences:', error);
      return {
        success: false,
        message: error.message || 'Failed to update sound preferences',
      };
    }
  },

  // Update theme preferences
  updateThemePreferences: async (themePrefs) => {
    try {
      const response = await api.put('/user/settings/theme', themePrefs);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating theme preferences:', error);
      return {
        success: false,
        message: error.message || 'Failed to update theme preferences',
      };
    }
  },

  // Update language preference
  updateLanguage: async (language) => {
    try {
      const response = await api.put('/user/settings/language', { language });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating language:', error);
      return {
        success: false,
        message: error.message || 'Failed to update language',
      };
    }
  },
};

export default settingsService;
