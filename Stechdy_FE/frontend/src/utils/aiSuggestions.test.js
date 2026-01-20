/**
 * Test file for AI Suggestions utility
 * Run this in browser console to test suggestions
 */

// Mock translation function for testing
const createMockT = (lang = 'vi') => {
  const translations = {
    vi: {
      'dashboard.aiSuggestions.motivation': [
        "Hãy tin vào bản thân! Bạn có thể làm được điều này 🌟",
        "Mỗi phút học đều là một bước tiến! Cố lên 💪",
        "Thành công bắt đầu từ hôm nay. Hãy tận dụng tối đa! 🚀",
      ],
      'dashboard.aiSuggestions.break': [
        "Hãy nghỉ ngơi 15 phút nhé ☕",
        "Đã đến lúc thư giãn đầu óc rồi! Nghỉ ngơi nào 🌸",
      ],
      'dashboard.aiSuggestions.morning': [
        "Chào buổi sáng! Hãy bắt đầu ngày mới với động lực học tập 🌅",
      ],
      'dashboard.aiSuggestions.afternoon': [
        "Buổi chiều tràn đầy năng lượng! Tiếp tục học thôi 🌤️",
      ],
      'dashboard.aiSuggestions.evening': [
        "Buổi tối là thời gian hoàn hảo để ôn lại bài học 🌙",
      ],
    },
    en: {
      'dashboard.aiSuggestions.motivation': [
        "Believe in yourself! You can do this 🌟",
        "Every minute of study is a step forward! Keep going 💪",
      ],
      'dashboard.aiSuggestions.break': [
        "Consider taking a 15-minute break ☕",
      ],
    }
  };

  return (key, options) => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], translations[lang]);
    if (options?.returnObjects && Array.isArray(value)) {
      return value;
    }
    return Array.isArray(value) ? value[0] : value || key;
  };
};

// Test scenarios
const testScenarios = [
  {
    name: 'Morning, No progress',
    context: {
      progressPercent: 0,
      completedMinutes: 0,
      upcomingSessionsCount: 2,
      consecutiveStudyMinutes: 0,
    },
  },
  {
    name: 'Morning, 50% progress',
    context: {
      progressPercent: 50,
      completedMinutes: 90,
      upcomingSessionsCount: 1,
      consecutiveStudyMinutes: 45,
    },
  },
  {
    name: 'Afternoon, 80% progress',
    context: {
      progressPercent: 80,
      completedMinutes: 150,
      upcomingSessionsCount: 0,
      consecutiveStudyMinutes: 60,
    },
  },
  {
    name: 'Evening, Long study session (2+ hours)',
    context: {
      progressPercent: 60,
      completedMinutes: 150,
      upcomingSessionsCount: 1,
      consecutiveStudyMinutes: 130,
    },
  },
  {
    name: 'Multiple sessions upcoming',
    context: {
      progressPercent: 30,
      completedMinutes: 45,
      upcomingSessionsCount: 4,
      consecutiveStudyMinutes: 45,
    },
  },
];

// Run tests
console.log('=== AI Suggestions Test ===\n');

testScenarios.forEach(scenario => {
  console.log(`\n📋 Scenario: ${scenario.name}`);
  console.log('Context:', scenario.context);
  
  // Test Vietnamese
  const tVi = createMockT('vi');
  console.log('🇻🇳 Vietnamese suggestions (5 random):');
  for (let i = 0; i < 5; i++) {
    // Note: You'll need to import the actual function to test
    console.log(`  ${i + 1}. [Random suggestion would appear here]`);
  }
  
  // Test English
  const tEn = createMockT('en');
  console.log('🇬🇧 English suggestions (5 random):');
  for (let i = 0; i < 5; i++) {
    console.log(`  ${i + 1}. [Random suggestion would appear here]`);
  }
});

console.log('\n=== Test Complete ===');
console.log('\n💡 To fully test:');
console.log('1. Open Dashboard in browser');
console.log('2. Refresh page multiple times');
console.log('3. Check AI suggestion changes');
console.log('4. Test at different times of day');
console.log('5. Test with different progress levels');

export default {
  testScenarios,
  createMockT,
};
