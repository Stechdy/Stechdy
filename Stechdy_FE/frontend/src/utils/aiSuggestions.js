/**
 * AI Suggestion Helper Utility
 * Provides random AI suggestions based on context and time of day
 */

// Default suggestions fallback - comprehensive multilingual support
const defaultSuggestions = {
  vi: {
    motivation: [
      "Hãy tin vào bản thân! Bạn có thể làm được điều này 🌟",
      "Mỗi phút học đều là một bước tiến! Cố lên 💪",
      "Thành công bắt đầu từ hôm nay. Hãy tận dụng tối đa! 🚀",
      "Bạn đang làm rất tốt! Tiếp tục duy trì nhé ⭐",
      "Học tập là đầu tư tốt nhất cho tương lai 📚",
      "Mỗi bài học là một cơ hội mới để phát triển 🌱",
      "Hành trình ngàn dặm bắt đầu từ những bước chân nhỏ 👣",
      "Bạn mạnh mẽ hơn bạn nghĩ! Tiến lên 💫",
      "Kiến thức là sức mạnh! Hãy tiếp tục học hỏi 🧠",
      "Đừng bao giờ ngừng học hỏi! Bạn làm tốt lắm 🎯"
    ],
    morning: [
      "Chào buổi sáng! Hãy bắt đầu ngày mới với động lực học tập 🌅",
      "Buổi sáng là thời gian vàng để học! Tận dụng nào 🌞",
      "Một ngày năng suất bắt đầu từ buổi sáng! Chúc bạn học tốt 🌻",
      "Não bộ hoạt động tốt nhất vào buổi sáng. Hãy tối ưu hóa! 🧠",
      "Sáng sớm tĩnh lặng, tuyệt vời để tập trung học 📖"
    ],
    afternoon: [
      "Buổi chiều tràn đầy năng lượng! Tiếp tục học thôi 🌤️",
      "Giữ vững phong độ học tập buổi chiều nhé 💪",
      "Đã ăn trưa chưa? Năng lượng là quan trọng đấy! 🍱",
      "Buổi chiều lý tưởng để ôn tập và củng cố kiến thức 📖",
      "Nghỉ ngơi một chút rồi tiếp tục chiến đấu nào! ☕"
    ],
    evening: [
      "Buổi tối là thời gian hoàn hảo để ôn lại bài học 🌙",
      "Kết thúc ngày với một buổi học thật tuyệt! ✨",
      "Chuẩn bị cho ngày mai từ hôm nay! Học tập hiệu quả 🌃",
      "Buổi tối yên tĩnh giúp bạn tập trung tốt hơn 🌆",
      "Ôn bài trước khi ngủ giúp ghi nhớ lâu hơn đấy! 💤"
    ],
    break: [
      "Hãy nghỉ ngơi 15 phút nhé ☕",
      "Đã đến lúc thư giãn đầu óc rồi! Nghỉ ngơi nào 🌸",
      "Đứng dậy vận động 5 phút sẽ giúp bạn tập trung hơn 🏃",
      "Hít thở sâu và thư giãn một chút nhé 🧘‍♀️"
    ],
    progress: [
      "Tiến độ tuyệt vời hôm nay! Bạn sắp hoàn thành mục tiêu 🎉",
      "Bạn đã hoàn thành một nửa! Tiếp tục cố gắng nhé 💪",
      "Wow! Bạn đang tiến bộ từng ngày! Tuyệt vời 📈"
    ]
  },
  en: {
    motivation: [
      "Believe in yourself! You can do this 🌟",
      "Every minute of study is a step forward! Keep going 💪",
      "Success starts today. Make the most of it! 🚀",
      "You're doing great! Keep it up ⭐",
      "Learning is the best investment for your future 📚",
      "Every lesson is a new opportunity to grow 🌱",
      "A journey of a thousand miles begins with small steps 👣",
      "You are stronger than you think! Move forward 💫",
      "Knowledge is power! Keep learning 🧠",
      "Never stop learning! You're doing amazing 🎯"
    ],
    morning: [
      "Good morning! Start your day with motivation 🌅",
      "Morning is the golden time to study! Let's go 🌞",
      "A productive day starts in the morning! Good luck 🌻",
      "Your brain works best in the morning. Optimize it! 🧠",
      "Quiet mornings are perfect for focused study 📖"
    ],
    afternoon: [
      "Afternoon full of energy! Keep studying 🌤️",
      "Maintain your study momentum in the afternoon 💪",
      "Had lunch yet? Energy is important! 🍱",
      "Afternoon is ideal for review and consolidation 📖",
      "Take a short break then continue the battle! ☕"
    ],
    evening: [
      "Evening is perfect for reviewing lessons 🌙",
      "End the day with a great study session! ✨",
      "Prepare for tomorrow starting today! Study effectively 🌃",
      "Quiet evenings help you focus better 🌆",
      "Reviewing before sleep helps remember longer! 💤"
    ],
    break: [
      "Take a 15-minute break ☕",
      "Time to relax your mind! Take a rest 🌸",
      "Stand up and move for 5 minutes to focus better 🏃",
      "Take a deep breath and relax a bit 🧘‍♀️"
    ],
    progress: [
      "Great progress today! You're close to completing your goal 🎉",
      "You've completed half! Keep pushing 💪",
      "Wow! You're improving every day! Amazing 📈"
    ]
  }
};

/**
 * Get random item from array
 */
const getRandomItem = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) return null;
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
 * Get current language - check multiple sources
 */
const getCurrentLanguage = () => {
  try {
    // Check multiple possible localStorage keys for i18next
    const i18nextLng = localStorage.getItem('i18nextLng');
    const language = localStorage.getItem('language');
    const lng = localStorage.getItem('lng');
    
    // Get the language value from any available source
    const lang = i18nextLng || language || lng || 'vi';
    
    // Check if it starts with 'en' (covers 'en', 'en-US', 'en-GB', etc.)
    if (lang.toLowerCase().startsWith('en')) {
      return 'en';
    }
    
    // Default to Vietnamese
    return 'vi';
  } catch {
    return 'vi';
  }
};

/**
 * Get random AI suggestion based on context
 * @param {Object|string} tOrLang - Translation function from i18next OR language string ('en', 'vi')
 * @param {Object} context - Context object
 * @returns {string} Random suggestion message
 */
export const getRandomAISuggestion = (tOrLang, context = {}) => {
  let lang = 'vi';
  
  // Check if first parameter is a string (language code)
  if (typeof tOrLang === 'string') {
    lang = tOrLang.toLowerCase().startsWith('en') ? 'en' : 'vi';
  } else {
    // It's the t function - try to get language from localStorage
    lang = getCurrentLanguage();
  }
  
  const timeOfDay = getTimeOfDay();
  const suggestions = defaultSuggestions[lang] || defaultSuggestions.vi;
  
  // Combine time-based and motivation suggestions
  const allSuggestions = [
    ...(suggestions[timeOfDay] || []),
    ...(suggestions.motivation || [])
  ];
  
  // Get random suggestion
  const suggestion = getRandomItem(allSuggestions);
  
  // Return with language-appropriate fallback
  const fallback = lang === 'en' 
    ? "Believe in yourself! You can do this 🌟"
    : "Hãy tin vào bản thân! Bạn có thể làm được điều này 🌟";
  
  return suggestion || fallback;
};

/**
 * Get suggestion for specific scenario (backward compatibility)
 * @param {Object} t - Translation function
 * @param {string} scenario - Scenario key
 * @returns {string} Suggestion message
 */
export const getScenarioSuggestion = (t, scenario) => {
  const lang = getCurrentLanguage();
  const suggestions = defaultSuggestions[lang] || defaultSuggestions.vi;
  return getRandomItem(suggestions.motivation) || suggestions.motivation[0];
};

export default {
  getRandomAISuggestion,
  getScenarioSuggestion,
  getTimeOfDay,
};
