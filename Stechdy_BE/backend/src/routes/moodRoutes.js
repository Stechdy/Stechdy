const express = require('express');
const router = express.Router();
const {
  createMoodEntry,
  getMoodEntries,
  getTodayMood,
  getMoodByDate,
  getMoodStats,
  deleteMoodEntry,
  generateMoodInsight,
  makeupMoodCheckIn,
  getStreakInfo
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Mood CRUD routes
router.post('/', createMoodEntry);
router.get('/', getMoodEntries);
router.get('/today', getTodayMood);
router.get('/stats', getMoodStats);
router.get('/date/:date', getMoodByDate);
router.delete('/:id', deleteMoodEntry);

// Streak and Makeup routes
router.post('/makeup', makeupMoodCheckIn);
router.get('/streak', getStreakInfo);

// AI Insight
router.post('/:id/insight', generateMoodInsight);

module.exports = router;
