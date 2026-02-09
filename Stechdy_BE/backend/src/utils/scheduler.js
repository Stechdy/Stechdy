const cron = require('node-cron');
const { 
  sendDailyMoodReminders, 
  sendEveningMoodReminder,
  sendTaskReminders,
  sendStudySessionReminders,
  sendDeadlineReminders,
  autoMarkMissedSessions
} = require('../services/notificationService');

// Initialize all scheduled tasks
const initializeScheduler = () => {
  console.log('Initializing task scheduler...');

  // ========== MOOD REMINDERS ==========
  
  // Send mood reminder at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('Running morning mood reminder task...');
    try {
      await sendDailyMoodReminders();
    } catch (error) {
      console.error('Morning mood reminder failed:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  // Send evening reminder at 7:00 PM for users who haven't checked in
  cron.schedule('0 19 * * *', async () => {
    console.log('Running evening mood reminder task...');
    try {
      await sendEveningMoodReminder();
    } catch (error) {
      console.error('Evening mood reminder failed:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  // ========== TASK REMINDERS ==========
  
  // Check for task reminders every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running task reminder check...');
    try {
      await sendTaskReminders();
    } catch (error) {
      console.error('Task reminder failed:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  // ========== STUDY SESSION IN-APP NOTIFICATIONS ==========
  
  // Check for study sessions every 15 minutes (in-app notifications only)
  cron.schedule('*/15 * * * *', async () => {
    console.log('Running study session in-app notification check...');
    try {
      await sendStudySessionReminders();
    } catch (error) {
      console.error('Study session notification failed:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  // ========== AUTO-MARK MISSED SESSIONS ==========
  
  // Check for missed sessions every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await autoMarkMissedSessions();
    } catch (error) {
      console.error('Auto-mark missed sessions failed:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  // ========== DEADLINE REMINDERS ==========
  
  // Check for deadlines at 8:00 AM and 6:00 PM daily
  cron.schedule('0 8,18 * * *', async () => {
    console.log('Running deadline reminder check...');
    try {
      await sendDeadlineReminders();
    } catch (error) {
      console.error('Deadline reminder failed:', error);
    }
  }, {
    timezone: "Asia/Ho_Chi_Minh"
  });

  console.log('========================================');
  console.log('✅ Scheduler initialized successfully!');
  console.log('========================================');
  console.log('📅 Scheduled Tasks:');
  console.log('  🌅 Morning mood reminders: 9:00 AM daily');
  console.log('  🌙 Evening mood reminders: 7:00 PM daily');
  console.log('  ✅ Task reminders: Every hour');
  console.log('  📱 Study session in-app notifications: Every 15 min');
  console.log('  ❌ Auto-mark missed sessions: Every 5 min');
  console.log('  ⏰ Deadline reminders: 8:00 AM & 6:00 PM daily');
  console.log('  📧 Email reminders: sessionReminderService (every min)');
  console.log('========================================');
};

module.exports = { initializeScheduler };
