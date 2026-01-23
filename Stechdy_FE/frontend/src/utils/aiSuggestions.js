/**
 * AI Suggestion Helper Utility
 * Provides random AI suggestions based on context and time of day
 */

/**
 * Get random item from array
 */
const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get time of day category
 * @returns {string} 'morning' | 'afternoon' | 'evening'
 */
export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

/**
 * Get random AI suggestion based on context
 * @param {Object} t - Translation function from i18next
 * @param {Object} context - Context object containing:
 *   - progressPercent: number (0-100)
 *   - completedMinutes: number
 *   - upcomingSessionsCount: number
 *   - consecutiveStudyMinutes: number
 * @returns {string} Random suggestion message
 */
export const getRandomAISuggestion = (t, context = {}) => {
  const {
    progressPercent = 0,
    completedMinutes = 0,
    upcomingSessionsCount = 0,
    consecutiveStudyMinutes = 0,
  } = context;

  // Determine suggestion category based on context
  let categories = [];
  let weights = [];

  // Time-based suggestions (always include with lower weight)
  const timeOfDay = getTimeOfDay();
  categories.push(t(`dashboard.aiSuggestions.${timeOfDay}`, { returnObjects: true }));
  weights.push(1);

  // Progress-based suggestions
  if (progressPercent >= 80) {
    categories.push(t('dashboard.aiSuggestions.progress', { returnObjects: true }));
    weights.push(3); // Higher weight for progress messages when doing well
  } else if (progressPercent >= 50) {
    categories.push(t('dashboard.aiSuggestions.progress', { returnObjects: true }));
    weights.push(2);
  }

  // Motivation suggestions (always available)
  categories.push(t('dashboard.aiSuggestions.motivation', { returnObjects: true }));
  weights.push(2);

  // Break suggestions
  if (consecutiveStudyMinutes >= 120) {
    categories.push(t('dashboard.aiSuggestions.longSession', { returnObjects: true }));
    weights.push(4); // High priority for long study sessions
  } else if (consecutiveStudyMinutes >= 50 || completedMinutes >= 90) {
    categories.push(t('dashboard.aiSuggestions.break', { returnObjects: true }));
    weights.push(2);
  }

  // Focus suggestions
  if (upcomingSessionsCount > 2) {
    categories.push(t('dashboard.aiSuggestions.multipleSessions', { returnObjects: true }));
    weights.push(3);
  } else if (upcomingSessionsCount > 0) {
    categories.push(t('dashboard.aiSuggestions.focus', { returnObjects: true }));
    weights.push(2);
  }

  // Weighted random selection of category
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  let selectedCategory = null;

  for (let i = 0; i < categories.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedCategory = categories[i];
      break;
    }
  }

  // Fallback to motivation if something went wrong
  if (!selectedCategory || !Array.isArray(selectedCategory)) {
    selectedCategory = t('dashboard.aiSuggestions.motivation', { returnObjects: true });
  }

  // Get random item from selected category
  return getRandomItem(selectedCategory) || t('dashboard.aiSuggestions.takeBreak');
};

/**
 * Get suggestion for specific scenario (backward compatibility)
 * @param {Object} t - Translation function
 * @param {string} scenario - Scenario key
 * @returns {string} Suggestion message
 */
export const getScenarioSuggestion = (t, scenario) => {
  const scenarioMap = {
    'takeBreak': 'takeBreak',
    'greatProgress': 'greatProgress',
    'halfwayThrough': 'halfwayThrough',
    'multipleSessions': 'multipleSessions',
    'twoHoursBreak': 'twoHoursBreak',
  };

  const key = scenarioMap[scenario] || scenario;
  return t(`dashboard.aiSuggestions.${key}`);
};

export default {
  getRandomAISuggestion,
  getScenarioSuggestion,
  getTimeOfDay,
};
