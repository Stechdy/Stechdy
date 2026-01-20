import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRandomAISuggestion, getTimeOfDay } from '../../utils/aiSuggestions';
import './AISuggestionDemo.css';

/**
 * Demo component để showcase AI Suggestions feature
 * Component này có thể được thêm vào Settings hoặc Debug page
 */
const AISuggestionDemo = () => {
  const { t, i18n } = useTranslation();
  const [suggestion, setSuggestion] = useState('');
  const [context, setContext] = useState({
    progressPercent: 50,
    completedMinutes: 90,
    upcomingSessionsCount: 2,
    consecutiveStudyMinutes: 45,
  });

  const generateNewSuggestion = () => {
    const newSuggestion = getRandomAISuggestion(t, context);
    setSuggestion(newSuggestion);
  };

  const presetScenarios = [
    {
      name: 'Mới bắt đầu / Just Started',
      context: { progressPercent: 0, completedMinutes: 0, upcomingSessionsCount: 3, consecutiveStudyMinutes: 0 }
    },
    {
      name: 'Đang làm tốt / Doing Well',
      context: { progressPercent: 60, completedMinutes: 100, upcomingSessionsCount: 1, consecutiveStudyMinutes: 50 }
    },
    {
      name: 'Gần hoàn thành / Almost Done',
      context: { progressPercent: 85, completedMinutes: 180, upcomingSessionsCount: 0, consecutiveStudyMinutes: 90 }
    },
    {
      name: 'Cần nghỉ / Need Break',
      context: { progressPercent: 40, completedMinutes: 80, upcomingSessionsCount: 2, consecutiveStudyMinutes: 130 }
    },
    {
      name: 'Nhiều buổi học / Multiple Sessions',
      context: { progressPercent: 30, completedMinutes: 60, upcomingSessionsCount: 5, consecutiveStudyMinutes: 30 }
    },
  ];

  const currentLanguage = i18n.language === 'vi' ? 'Tiếng Việt' : 'English';
  const currentTime = getTimeOfDay();
  const timeLabels = {
    morning: { vi: 'Buổi sáng', en: 'Morning' },
    afternoon: { vi: 'Buổi chiều', en: 'Afternoon' },
    evening: { vi: 'Buổi tối', en: 'Evening' },
  };

  return (
    <div className="ai-suggestion-demo">
      <div className="demo-header">
        <h2>🤖 AI Suggestion Demo</h2>
        <p>Test random AI suggestions với các scenarios khác nhau</p>
      </div>

      <div className="demo-info">
        <div className="info-item">
          <strong>Ngôn ngữ / Language:</strong> {currentLanguage}
        </div>
        <div className="info-item">
          <strong>Thời gian / Time of Day:</strong>{' '}
          {i18n.language === 'vi' ? timeLabels[currentTime].vi : timeLabels[currentTime].en}
        </div>
      </div>

      <div className="demo-scenarios">
        <h3>Preset Scenarios:</h3>
        <div className="scenario-buttons">
          {presetScenarios.map((scenario, index) => (
            <button
              key={index}
              className="scenario-btn"
              onClick={() => {
                setContext(scenario.context);
                setSuggestion('');
              }}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      <div className="demo-context">
        <h3>Current Context:</h3>
        <div className="context-grid">
          <div className="context-item">
            <label>Progress:</label>
            <span>{context.progressPercent}%</span>
          </div>
          <div className="context-item">
            <label>Completed:</label>
            <span>{context.completedMinutes} min</span>
          </div>
          <div className="context-item">
            <label>Upcoming:</label>
            <span>{context.upcomingSessionsCount} sessions</span>
          </div>
          <div className="context-item">
            <label>Consecutive:</label>
            <span>{context.consecutiveStudyMinutes} min</span>
          </div>
        </div>
      </div>

      <div className="demo-action">
        <button className="generate-btn" onClick={generateNewSuggestion}>
          🎲 Generate Random Suggestion
        </button>
      </div>

      {suggestion && (
        <div className="demo-result">
          <h3>AI Suggestion:</h3>
          <div className="suggestion-card">
            <div className="suggestion-icon">🤖</div>
            <p className="suggestion-text">{suggestion}</p>
          </div>
          <p className="tip">💡 Click generate nhiều lần để xem các suggestions khác nhau!</p>
        </div>
      )}

      <div className="demo-stats">
        <h3>📊 Statistics:</h3>
        <ul>
          <li>Total suggestion templates: 44+ (per language)</li>
          <li>Categories: 9 (motivation, break, focus, progress, time-based, etc.)</li>
          <li>Languages supported: 2 (Vietnamese, English)</li>
          <li>Smart weighting: Yes (context-aware priority)</li>
        </ul>
      </div>
    </div>
  );
};

export default AISuggestionDemo;
