const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Streak = require('../models/Streak');
const MoodTracking = require('../models/MoodTracking');

// @desc    Get debug info for streak
// @route   GET /api/debug/streak
// @access  Private
router.get('/streak', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get streak data
    const streak = await Streak.findOne({ userId });
    
    // Get mood entries
    const moods = await MoodTracking.find({ userId }).sort({ date: -1 });
    
    res.json({
      success: true,
      data: {
        streak: {
          currentStreak: streak?.currentStreak || 0,
          longestStreak: streak?.longestStreak || 0,
          totalActiveDays: streak?.totalActiveDays || 0,
          lastActiveDate: streak?.lastActiveDate,
          streakHistoryCount: streak?.streakHistory?.length || 0,
          streakHistory: streak?.streakHistory?.map(h => ({
            date: h.date,
            isMakeup: h.isMakeup,
            activityCount: h.activityCount
          })) || []
        },
        moods: {
          totalCount: moods.length,
          entries: moods.map(m => ({
            date: m.date,
            mood: m.mood,
            createdAt: m.createdAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('Debug streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting debug info',
      error: error.message
    });
  }
});

module.exports = router;
