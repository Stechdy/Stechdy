const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserStreak,
  getCurrentUser,
  getUserSettings,
  updateUserSettings,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/streak', protect, getUserStreak);
router.route('/settings').get(protect, getUserSettings).put(protect, updateUserSettings);

module.exports = router;
