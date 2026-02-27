const mongoose = require('mongoose');
require('dotenv').config();
require('./src/models');

const StudySessionSchedule = require('./src/models/StudySessionSchedule');
const StudyTimetable = require('./src/models/StudyTimetable');
const User = require('./src/models/User');
const Subject = require('./src/models/Subject');

async function createImmediateTestSession() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Xóa test sessions cũ
    const deleted = await StudySessionSchedule.deleteMany({ 
      topic: { $regex: /Test email reminder/i }
    });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Deleted ${deleted.deletedCount} old test session(s)`);
    }

    const user = await User.findOne({ email: 'tai05112004@gmail.com' });
    if (!user) throw new Error('User not found');

    const subject = await Subject.findOne({ userId: user._id });
    if (!subject) throw new Error('No subject found for user');

    let timetable = await StudyTimetable.findOne({ userId: user._id });
    if (!timetable) {
      console.log('📋 Creating timetable...');
      timetable = await StudyTimetable.create({
        userId: user._id,
        semesterId: subject.semesterId,
        generatedBy: 'manual',
        status: 'active'
      });
    }

    const now = new Date();
    
    // Tạo session bắt đầu sau chính xác 15 phút
    const sessionStart = new Date(now.getTime() + 15 * 60 * 1000);
    const sessionEnd = new Date(sessionStart.getTime() + 90 * 60 * 1000);

    const h = sessionStart.getHours();
    const m = sessionStart.getMinutes();
    const eh = sessionEnd.getHours();
    const em = sessionEnd.getMinutes();

    const startTime = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
    const endTime = String(eh).padStart(2,'0')+':'+String(em).padStart(2,'0');

    const sessionType = h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : 'evening';

    const sessionDate = new Date(now);
    sessionDate.setHours(0, 0, 0, 0);
    const timezoneOffset = sessionDate.getTimezoneOffset();
    const adjustedDate = new Date(sessionDate.getTime() - (timezoneOffset * 60 * 1000));

    const testSession = await StudySessionSchedule.create({
      timetableId: timetable._id,
      userId: user._id,
      subjectId: subject._id,
      date: adjustedDate,
      dayOfWeek: sessionStart.getDay(),
      sessionType: sessionType,
      startTime: startTime,
      endTime: endTime,
      topic: 'Test email reminder - IMMEDIATE',
      status: 'scheduled',
      plannedDuration: 90
    });

    console.log('\n🎉 IMMEDIATE TEST SESSION CREATED!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Session ID:', testSession._id);
    console.log('👤 User:', user.email);
    console.log('📚 Subject:', subject.subjectName);
    console.log('⏰ Time:', startTime, '-', endTime);
    console.log('🕐 Session starts at:', sessionStart.toLocaleTimeString('vi-VN'));
    console.log('⏱️  Minutes until start: 15 minutes (PERFECT for testing!)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📬 Email will be sent in the next 1-2 minutes!');
    console.log('   🔍 Reminder window: 14-16 minutes before session');
    console.log('   ⏰ Current time:', now.toLocaleTimeString('vi-VN'));
    console.log('   📧 Email should arrive around:', now.toLocaleTimeString('vi-VN'));
    console.log('\n🚨 IMPORTANT: Make sure server is running!');
    console.log('   Check for log: "🔍 [time] Checking X session(s) for reminders..."');
    console.log('   Every minute you should see scheduler running');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createImmediateTestSession();
