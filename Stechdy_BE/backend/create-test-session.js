const mongoose = require('mongoose');
require('dotenv').config();
require('./src/models');
const StudySessionSchedule = require('./src/models/StudySessionSchedule');
const StudyTimetable = require('./src/models/StudyTimetable');
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    // Xóa hết test session cũ
    const del = await StudySessionSchedule.deleteMany({ 
      topic: { $regex: /Test email reminder/i }
    });
    console.log(`🗑️  Deleted ${del.deletedCount} old test sessions`);

    const user = await User.findOne({ email: 'tai05112004@gmail.com' });
    const subject = await Subject.findOne({ userId: user._id });
    const timetable = await StudyTimetable.findOne({ userId: user._id });

    const now = new Date();
    const sessionStart = new Date(now.getTime() + 15 * 60 * 1000);
    const sessionEnd = new Date(sessionStart.getTime() + 90 * 60 * 1000);
    
    const startTime = String(sessionStart.getHours()).padStart(2, '0') + ':' + String(sessionStart.getMinutes()).padStart(2, '0');
    const endTime = String(sessionEnd.getHours()).padStart(2, '0') + ':' + String(sessionEnd.getMinutes()).padStart(2, '0');
    const sessionType = sessionStart.getHours() >= 18 ? 'evening' : sessionStart.getHours() >= 12 ? 'afternoon' : 'morning';
    
    const sessionDate = new Date(now);
    sessionDate.setHours(0, 0, 0, 0);
    const adjusted = new Date(sessionDate.getTime() - (sessionDate.getTimezoneOffset() * 60000));

    const s = await StudySessionSchedule.create({
      timetableId: timetable._id,
      userId: user._id,
      subjectId: subject._id,
      date: adjusted,
      dayOfWeek: sessionStart.getDay(),
      sessionType,
      startTime,
      endTime,
      topic: 'Test email reminder - FINAL',
      status: 'scheduled',
      plannedDuration: 90
    });

    console.log('\n🎉 SESSION CREATED!');
    console.log('📝 ID:', s._id.toString());
    console.log('⏰ Time:', startTime, '-', endTime);
    console.log('🕐 Now:', now.toLocaleTimeString('vi-VN'));
    console.log('📧 Email should arrive within ~1 minute after server starts!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
})();
