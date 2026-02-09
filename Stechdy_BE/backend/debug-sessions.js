const mongoose = require('mongoose');
require('dotenv').config();
require('./src/models');

const StudySessionSchedule = require('./src/models/StudySessionSchedule');
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

// Parse time string (HH:MM) thành Date object
const parseTime = (timeStr, date) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

async function debugSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    const now = new Date();
    
    // Get today's sessions
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('🕐 Current time:', now.toLocaleString('vi-VN'));
    console.log('📅 Checking sessions for:', today.toLocaleDateString('vi-VN'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sessions = await StudySessionSchedule.find({
      date: { $gte: today, $lt: tomorrow },
      status: 'scheduled'
    }).populate('userId subjectId').sort({ startTime: 1 });

    console.log(`📚 Found ${sessions.length} scheduled session(s) for today:\n`);

    if (sessions.length === 0) {
      console.log('⚠️  No sessions found for today');
      console.log('💡 Run: node test-session.js to create a test session\n');
      process.exit(0);
    }

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const sessionStart = parseTime(session.startTime, session.date);
      const timeDiff = sessionStart - now;
      const minutesUntil = Math.floor(timeDiff / 60000);

      console.log(`Session ${i + 1}:`);
      console.log('  📝 ID:', session._id);
      console.log('  👤 User:', session.userId?.email || 'Unknown');
      console.log('  📚 Subject:', session.subjectId?.subjectName || 'Unknown');
      console.log('  📖 Topic:', session.topic);
      console.log('  ⏰ Time:', session.startTime, '-', session.endTime);
      console.log('  🕐 Starts at:', sessionStart.toLocaleTimeString('vi-VN'));
      console.log('  ⏱️  Time until start:', minutesUntil, 'minutes');
      
      // Check reminder window
      if (minutesUntil < 0) {
        console.log('  ⚠️  Status: SESSION HAS PASSED');
      } else if (minutesUntil >= 14 && minutesUntil <= 16) {
        console.log('  ✅ Status: IN REMINDER WINDOW (14-16 min) - Email should be sent!');
      } else if (minutesUntil < 14) {
        console.log('  ⏳ Status: TOO CLOSE - Reminder window passed');
      } else {
        console.log('  ⏳ Status: TOO FAR - Wait until 14-16 minutes before');
        const reminderTime = new Date(sessionStart.getTime() - 15 * 60 * 1000);
        console.log('  📧 Reminder will be sent around:', reminderTime.toLocaleTimeString('vi-VN'));
      }
      
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📬 Email Reminder System Info:');
    console.log('   🔍 Check interval: Every 1 minute');
    console.log('   ⏱️  Reminder window: 14-16 minutes before session');
    console.log('   🎯 Scheduler: sessionReminderService.js');
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Sessions must be 14-16 minutes away to receive email');
    console.log('   - Check email settings: node check-email-settings.js');
    console.log('   - Create test session: node test-session.js');
    console.log('   - Start server: npm start');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugSessions();
