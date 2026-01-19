const nodemailer = require('nodemailer');
const User = require('../models/User');
const Settings = require('../models/Settings');
const MoodTracking = require('../models/MoodTracking');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const StudySessionSchedule = require('../models/StudySessionSchedule');
const Deadline = require('../models/Deadline');
const Subject = require('../models/Subject');
const { sendNewNotification, sendUnreadCountUpdate } = require('./socketService');
const {
  generateTaskReminderMessage,
  generateStudyReminderMessage,
  generateDeadlineReminderMessage,
  generateAchievementMessage,
  formatTimeUntil
} = require('./personalizedMessageService');

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send mood check-in reminder email
const sendMoodReminderEmail = async (user) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email service not configured');
    return false;
  }

  try {
    const mailOptions = {
      from: `"S-Techdy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🌟 Nhắc nhở: Ghi lại cảm xúc hôm nay!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 20px;
              padding: 40px;
              text-align: center;
              color: white;
            }
            .emoji {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              margin: 0 0 16px 0;
              font-size: 28px;
            }
            p {
              margin: 0 0 24px 0;
              font-size: 16px;
              opacity: 0.95;
            }
            .btn {
              display: inline-block;
              padding: 14px 32px;
              background: white;
              color: #667eea;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
            }
            .btn:hover {
              transform: scale(1.05);
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid rgba(255,255,255,0.2);
              font-size: 14px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">😊</div>
            <h1>Xin chào ${user.name}!</h1>
            <p>
              Hôm nay bạn cảm thấy thế nào? Hãy dành vài giây để ghi lại cảm xúc của bạn.
              Theo dõi tâm trạng giúp bạn hiểu rõ hơn về bản thân và cải thiện sức khỏe tinh thần! 💙
            </p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mood" class="btn">
              Ghi lại cảm xúc ngay
            </a>
            <div class="footer">
              <p>S-Techdy - Your Study Companion</p>
              <p style="font-size: 12px;">
                Bạn nhận được email này vì đã bật thông báo nhắc nhở trong cài đặt.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Mood reminder email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending mood reminder email:', error);
    return false;
  }
};

// Create in-app notification
const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
      isRead: false
    });
    
    // Emit realtime notification via Socket.IO
    sendNewNotification(userId, notification);
    
    // Update unread count
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });
    sendUnreadCountUpdate(userId, unreadCount);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Check and send mood reminders to users who haven't checked in today
const sendDailyMoodReminders = async () => {
  try {
    console.log('Starting daily mood reminder check...');

    // Get all users with notifications enabled
    const users = await User.find({
      'notificationSettings.studyReminder': true
    });

    console.log(`Found ${users.length} users with notifications enabled`);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let sentCount = 0;
    let notificationCount = 0;

    for (const user of users) {
      // Check if user has already checked in today
      const todayMood = await MoodTracking.findOne({
        userId: user._id,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      // If no mood entry today, send reminder
      if (!todayMood) {
        // Send email if email notifications enabled
        const userSettings = await Settings.findOne({ userId: user._id });
        const emailEnabled = userSettings?.notification?.email && user.notificationSettings.dailyEmail;
        
        if (emailEnabled) {
          const emailSent = await sendMoodReminderEmail(user);
          if (emailSent) sentCount++;
        }

        // Create in-app notification
        await createNotification(
          user._id,
          'mood_checkin',
          'notifications.content.moodCheckinTitle',
          'notifications.content.moodCheckinMessage'
        );
        notificationCount++;
      }
    }

    console.log(`Mood reminders sent: ${sentCount} emails, ${notificationCount} notifications`);
    return { emailsSent: sentCount, notificationsCreated: notificationCount };
  } catch (error) {
    console.error('Error in sendDailyMoodReminders:', error);
    throw error;
  }
};

// Send evening reminder (for users who haven't checked in yet)
const sendEveningMoodReminder = async () => {
  console.log('Sending evening mood reminders...');
  return await sendDailyMoodReminders();
};

/**
 * Send task reminders to users
 * Checks for tasks due within next 24 hours
 */
const sendTaskReminders = async () => {
  try {
    console.log('Starting task reminder check...');

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find tasks that are due within 24 hours and not completed
    const tasks = await Task.find({
      status: { $ne: 'done' },
      dueDate: { $gte: now, $lte: tomorrow },
      'reminder.enabled': true
    }).populate('userId');

    console.log(`Found ${tasks.length} tasks needing reminders`);

    let sentCount = 0;

    for (const task of tasks) {
      if (!task.userId) continue;

      // Check if user wants task reminders
      if (!task.userId.notificationSettings?.studyReminder) continue;

      // Check if we already sent a reminder today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingNotification = await Notification.findOne({
        userId: task.userId._id,
        type: 'task_reminder',
        relatedId: task._id,
        createdAt: { $gte: today }
      });

      if (existingNotification) continue;

      // Generate personalized message
      const { title, message, icon } = await generateTaskReminderMessage(task, task.userId);

      // Create notification
      await Notification.create({
        userId: task.userId._id,
        type: 'task_reminder',
        title,
        message,
        icon,
        priority: task.priority === 'high' ? 'high' : 'normal',
        relatedId: task._id,
        relatedType: 'Task',
        actionUrl: `/tasks/${task._id}`,
        actionLabel: 'Xem task'
      });

      sentCount++;

      // Send email if enabled
      const userSettings = await Settings.findOne({ userId: task.userId._id });
      const emailEnabled = userSettings?.notification?.email && task.userId.notificationSettings?.dailyEmail;
      
      if (emailEnabled) {
        await sendTaskReminderEmail(task, task.userId, message);
      }
    }

    console.log(`Task reminders sent: ${sentCount} notifications`);
    return { notificationsSent: sentCount };
  } catch (error) {
    console.error('Error sending task reminders:', error);
    throw error;
  }
};

/**
 * Send study session reminders
 * Checks for sessions starting within next 15 minutes
 */
const sendStudySessionReminders = async () => {
  try {
    console.log('Starting study session reminder check...');

    const now = new Date();
    const in15Minutes = new Date(now);
    in15Minutes.setMinutes(in15Minutes.getMinutes() + 15);

    // Get today's date range in Vietnam timezone (UTC+7)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    // Adjust for timezone to match how dates are stored in DB
    const timezoneOffset = today.getTimezoneOffset(); // Minutes from UTC
    const adjustedToday = new Date(today.getTime() - (timezoneOffset * 60 * 1000));
    const adjustedTomorrow = new Date(adjustedToday.getTime() + 24 * 60 * 60 * 1000);

    console.log('🔍 Searching sessions for today:', today.toLocaleDateString('vi-VN'));
    console.log('📅 DB query range:', adjustedToday.toISOString(), 'to', adjustedTomorrow.toISOString());
    console.log('⏰ Current time:', now.toLocaleTimeString('vi-VN'));
    console.log('⏰ Looking for sessions starting before:', in15Minutes.toLocaleTimeString('vi-VN'));

    // Find study sessions scheduled for today
    const sessions = await StudySessionSchedule.find({
      date: { $gte: adjustedToday, $lt: adjustedTomorrow },
      status: 'scheduled'
    }).populate('userId subjectId');

    console.log(`📚 Found ${sessions.length} sessions scheduled for today`);

    // Helper function to parse time string to Date object
    const parseTime = (timeStr, date) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };

    let sentCount = 0;
    let checkedCount = 0;

    for (const session of sessions) {
      checkedCount++;
      
      // Parse session start time
      const sessionStart = parseTime(session.startTime, session.date);
      const timeDiff = sessionStart - now;
      const minutesUntil = Math.floor(timeDiff / 60000);

      console.log(`  📋 Session ${checkedCount}: ${session.subjectId?.subjectName || 'Unknown'} at ${session.startTime}`);
      console.log(`     ⏱️  Starts in ${minutesUntil} minutes (${sessionStart.toLocaleTimeString('vi-VN')})`);

      // Check if session starts within next 15 minutes (and not in the past)
      if (timeDiff < 0 || timeDiff > 15 * 60 * 1000) {
        console.log(`     ⏭️  Skipped (not in 0-15 minute window)`);
        continue;
      }

      if (!session.userId) {
        console.log(`     ⚠️  Skipped (no user)`);
        continue;
      }

      // Check if user wants study reminders
      if (!session.userId.notificationSettings?.studyReminder) {
        console.log(`     ⚠️  Skipped (user disabled reminders)`);
        continue;
      }

      // Check if we already sent a reminder for this session
      const existingNotification = await Notification.findOne({
        userId: session.userId._id,
        type: 'study_reminder',
        relatedId: session._id,
        createdAt: { $gte: new Date(now.getTime() - 3600000) } // Within last hour
      });

      if (existingNotification) {
        console.log(`     ⚠️  Skipped (already sent within 1 hour)`);
        continue;
      }

      // Calculate time until session
      const timeUntil = formatTimeUntil(sessionStart);

      console.log(`     ✅ Sending reminder (${minutesUntil} minutes until session)...`);

      // Generate personalized message
      const { title, message, icon } = await generateStudyReminderMessage(
        session,
        session.userId,
        'before_session',
        timeUntil
      );

      // Create notification
      const notification = await Notification.create({
        userId: session.userId._id,
        type: 'study_reminder',
        title,
        message,
        icon,
        priority: 'normal',
        relatedId: session._id,
        relatedType: 'StudySession',
        actionUrl: `/study-sessions/${session._id}`,
        actionLabel: 'Xem lịch học',
        metadata: {
          subjectName: session.subjectId?.subjectName || 'Unknown',
          startTime: session.startTime
        }
      });

      console.log(`     📧 Notification created:`, notification._id);

      sentCount++;

      // Email reminder is disabled - using sessionReminderService for 15-min reminder instead
      // const userSettings = await Settings.findOne({ userId: session.userId._id });
      // const emailEnabled = userSettings?.notification?.email && session.userId.notificationSettings?.dailyEmail;
      // 
      // if (emailEnabled) {
      //   console.log(`     📨 Sending email to ${session.userId.email}...`);
      //   await sendStudySessionReminderEmail(session, session.userId, message);
      // }
    }

    console.log(`\n✅ Study session reminders sent: ${sentCount} notifications (checked ${checkedCount} sessions)`);
    return { notificationsSent: sentCount };
  } catch (error) {
    console.error('Error sending study session reminders:', error);
    throw error;
  }
};

/**
 * Send deadline reminders
 * Checks for deadlines approaching (24h, 3 days, 1 week)
 */
const sendDeadlineReminders = async () => {
  try {
    console.log('Starting deadline reminder check...');

    const now = new Date();
    const in24Hours = new Date(now);
    in24Hours.setHours(in24Hours.getHours() + 24);
    
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    // Find upcoming deadlines
    const deadlines = await Deadline.find({
      dueDate: { $gte: now, $lte: in7Days },
      isCompleted: false,
      status: { $nin: ['completed', 'cancelled'] }
    }).populate('userId subjectId');

    console.log(`Found ${deadlines.length} upcoming deadlines`);

    let sentCount = 0;

    for (const deadline of deadlines) {
      if (!deadline.userId) continue;

      // Check if user wants deadline reminders
      if (!deadline.userId.notificationSettings?.deadlineReminder) continue;

      const hoursUntil = (deadline.dueDate - now) / (1000 * 60 * 60);
      
      // Determine if we should send a reminder based on time remaining
      let shouldSend = false;
      let reminderType = '';

      if (hoursUntil <= 24) {
        reminderType = '24h';
        shouldSend = true;
      } else if (hoursUntil <= 72 && hoursUntil > 48) {
        reminderType = '3days';
        shouldSend = true;
      } else if (hoursUntil <= 168 && hoursUntil > 144) {
        reminderType = '7days';
        shouldSend = true;
      }

      if (!shouldSend) continue;

      // Check if we already sent this type of reminder
      const existingNotification = await Notification.findOne({
        userId: deadline.userId._id,
        type: 'task_reminder',
        relatedId: deadline._id,
        'metadata.reminderType': reminderType
      });

      if (existingNotification) continue;

      // Generate personalized message
      const { title, message, icon, priority } = await generateDeadlineReminderMessage(
        deadline,
        deadline.userId,
        hoursUntil
      );

      // Create notification
      await Notification.create({
        userId: deadline.userId._id,
        type: 'task_reminder',
        title,
        message,
        icon,
        priority,
        relatedId: deadline._id,
        relatedType: 'Task',
        actionUrl: `/deadlines/${deadline._id}`,
        actionLabel: 'Xem deadline',
        metadata: {
          reminderType,
          hoursUntil: Math.round(hoursUntil),
          deadlineType: deadline.deadlineType
        }
      });

      sentCount++;

      // Send email if enabled and urgent
      const userSettings = await Settings.findOne({ userId: deadline.userId._id });
      const emailEnabled = userSettings?.notification?.email && deadline.userId.notificationSettings?.dailyEmail;
      
      if (emailEnabled && hoursUntil <= 24) {
        await sendDeadlineReminderEmail(deadline, deadline.userId, message);
      }
    }

    console.log(`Deadline reminders sent: ${sentCount} notifications`);
    return { notificationsSent: sentCount };
  } catch (error) {
    console.error('Error sending deadline reminders:', error);
    throw error;
  }
};

/**
 * Send task reminder email
 */
const sendTaskReminderEmail = async (task, user, message) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    const dueDate = new Date(task.dueDate).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"S-Techdy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `⏰ Nhắc nhở Task: ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 40px; color: white; }
            .priority-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
            .high { background: #ff6b6b; }
            .medium { background: #ffa500; }
            .low { background: #51cf66; }
            h1 { margin: 0 0 16px 0; font-size: 24px; }
            .task-info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0; }
            .btn { display: inline-block; padding: 14px 32px; background: white; color: #667eea; text-decoration: none; border-radius: 25px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="priority-badge ${task.priority}">${task.priority === 'high' ? 'Ưu tiên cao' : task.priority === 'medium' ? 'Ưu tiên vừa' : 'Ưu tiên thấp'}</div>
            <h1>⏰ Task cần hoàn thành!</h1>
            <div class="task-info">
              <h2 style="margin-top: 0;">${task.title}</h2>
              ${task.description ? `<p>${task.description}</p>` : ''}
              <p><strong>📅 Deadline:</strong> ${dueDate}</p>
            </div>
            <p style="font-size: 16px;">${message}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks" class="btn">Xem task ngay</a>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Task reminder email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending task reminder email:', error);
    return false;
  }
};

/**
 * Send study session reminder email
 */
const sendStudySessionReminderEmail = async (session, user, message) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    const startTime = new Date(session.startTime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"S-Techdy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `📚 Nhắc nhở: Buổi học ${session.subjectId?.name || 'sắp bắt đầu'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 20px; padding: 40px; color: white; text-align: center; }
            .emoji { font-size: 64px; margin-bottom: 20px; }
            h1 { margin: 0 0 16px 0; font-size: 28px; }
            .session-info { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin: 20px 0; }
            .btn { display: inline-block; padding: 14px 32px; background: white; color: #f5576c; text-decoration: none; border-radius: 25px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">📚</div>
            <h1>Sắp đến giờ học!</h1>
            <div class="session-info">
              <h2 style="margin-top: 0;">${session.subjectId?.name || 'Môn học'}</h2>
              <p><strong>⏰ Thời gian:</strong> ${startTime}</p>
              ${session.location ? `<p><strong>📍 Địa điểm:</strong> ${session.location}</p>` : ''}
            </div>
            <p style="font-size: 16px;">${message}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar" class="btn">Xem lịch học</a>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Study session reminder email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending study session reminder email:', error);
    return false;
  }
};

/**
 * Send deadline reminder email
 */
const sendDeadlineReminderEmail = async (deadline, user, message) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    const dueDate = new Date(deadline.dueDate).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: `"S-Techdy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🚨 Deadline sắp đến: ${deadline.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); border-radius: 20px; padding: 40px; color: white; }
            .urgency-badge { display: inline-block; padding: 8px 16px; background: rgba(255,255,255,0.3); border-radius: 20px; font-weight: 600; margin-bottom: 20px; }
            h1 { margin: 0 0 16px 0; font-size: 26px; }
            .deadline-info { background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; margin: 20px 0; }
            .btn { display: inline-block; padding: 14px 32px; background: white; color: #ff6b6b; text-decoration: none; border-radius: 25px; font-weight: 600; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="urgency-badge">⚠️ KHẨN CẤP</div>
            <h1>🚨 Deadline sắp đến!</h1>
            <div class="deadline-info">
              <h2 style="margin-top: 0;">${deadline.title}</h2>
              ${deadline.description ? `<p>${deadline.description}</p>` : ''}
              <p><strong>📅 Hạn chót:</strong> ${dueDate}</p>
              <p><strong>📚 Môn:</strong> ${deadline.subjectId?.name || 'N/A'}</p>
              <p><strong>📋 Loại:</strong> ${deadline.deadlineType || 'N/A'}</p>
            </div>
            <p style="font-size: 16px;">${message}</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/deadlines" class="btn">Xem deadline</a>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Deadline reminder email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending deadline reminder email:', error);
    return false;
  }
};

/**
 * Create achievement notification
 */
const createAchievementNotification = async (userId, achievementType, data) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const { title, message, icon } = await generateAchievementMessage(achievementType, data, user);

    const notification = await Notification.create({
      userId,
      type: achievementType === 'level_up' ? 'level_up' : 
            achievementType === 'streak_milestone' ? 'streak_milestone' : 'achievement',
      title,
      message,
      icon,
      priority: 'high',
      metadata: data
    });

    return notification;
  } catch (error) {
    console.error('Error creating achievement notification:', error);
    return null;
  }
};

/**
 * Auto-mark sessions as missed if they passed end time without activity
 */
const autoMarkMissedSessions = async () => {
  try {
    console.log('🔍 Checking for missed sessions...');
    
    const now = new Date();
    
    // Find all scheduled sessions where end time has passed
    const sessions = await StudySessionSchedule.find({
      status: 'scheduled'
    }).populate('subjectId userId');

    let missedCount = 0;

    for (const session of sessions) {
      try {
        // Parse session date and end time
        const sessionDate = new Date(session.date);
        const [endHour, endMinute] = session.endTime.split(':').map(Number);
        
        // Create end datetime
        const sessionEndTime = new Date(sessionDate);
        sessionEndTime.setHours(endHour, endMinute, 0, 0);

        // If session end time has passed, mark as missed
        if (sessionEndTime < now) {
          await StudySessionSchedule.findByIdAndUpdate(session._id, {
            status: 'missed'
          });

          // Create notification for user
          await createNotification(
            session.userId._id,
            'study_reminder',
            `Buổi học ${session.subjectId.subjectName}`,
            `Bạn đã bỏ lỡ buổi học ${session.subjectId.subjectName} lúc ${session.startTime}`,
            { sessionId: session._id }
          );

          missedCount++;
          console.log(`✅ Marked session ${session._id} as missed (${session.subjectId.subjectName} at ${session.startTime})`);
        }
      } catch (error) {
        console.error(`Error processing session ${session._id}:`, error);
      }
    }

    if (missedCount > 0) {
      console.log(`✅ Auto-marked ${missedCount} session(s) as missed`);
    } else {
      console.log('ℹ️  No sessions to mark as missed');
    }

    return missedCount;
  } catch (error) {
    console.error('❌ Error in autoMarkMissedSessions:', error);
    throw error;
  }
};

module.exports = {
  sendMoodReminderEmail,
  createNotification,
  sendDailyMoodReminders,
  sendEveningMoodReminder,
  sendTaskReminders,
  sendStudySessionReminders,
  sendDeadlineReminders,
  createAchievementNotification,
  autoMarkMissedSessions
};

