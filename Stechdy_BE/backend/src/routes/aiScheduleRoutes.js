const express = require('express');
const router = express.Router();
const aiScheduleController = require('../controllers/aiScheduleController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Save AI generated schedule to database
router.post('/save', aiScheduleController.saveAISchedule);

// Get AI generated schedules
router.get('/', aiScheduleController.getAISchedules);

// Delete AI generated schedule
router.delete('/:generationId', aiScheduleController.deleteAISchedule);

module.exports = router;
