const mongoose = require('mongoose');
require('dotenv').config();
require('./src/models');

const User = require('./src/models/User');
const Settings = require('./src/models/Settings');

async function checkEmailSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    const user = await User.findOne({ email: 'tai05112004@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('\n👤 User:', user.email);
    console.log('🆔 User ID:', user._id);
    
    console.log('\n📱 User Notification Settings:');
    console.log('   studyReminder:', user.notificationSettings?.studyReminder);
    console.log('   dailyEmail:', user.notificationSettings?.dailyEmail);
    
    let settings = await Settings.findOne({ userId: user._id });
    
    console.log('\n⚙️  System Settings:');
    if (!settings) {
      console.log('   ⚠️  No settings found - creating default settings...');
      settings = await Settings.create({
        userId: user._id,
        notification: {
          email: true,
          push: true,
          inApp: true
        },
        privacy: {
          profileVisibility: 'public'
        },
        study: {
          defaultSessionDuration: 45,
          breakDuration: 10,
          autoStartSessions: false
        }
      });
      console.log('   ✅ Default settings created');
    }
    
    console.log('   Email:', settings.notification?.email);
    console.log('   Push:', settings.notification?.push);
    console.log('   In-App:', settings.notification?.inApp);

    console.log('\n📊 Email Reminder Status:');
    const emailEnabled = settings.notification?.email && user.notificationSettings?.studyReminder;
    
    if (emailEnabled) {
      console.log('   ✅ Email reminders are ENABLED');
      console.log('   📧 Emails will be sent to:', user.email);
    } else {
      console.log('   ❌ Email reminders are DISABLED');
      if (!settings.notification?.email) {
        console.log('   ⚠️  Reason: System email setting is OFF');
        console.log('   🔧 Fix: Enable in Settings collection');
      }
      if (!user.notificationSettings?.studyReminder) {
        console.log('   ⚠️  Reason: User studyReminder is OFF');
        console.log('   🔧 Fix: Enable in User.notificationSettings');
      }
    }

    // Auto-fix if needed
    if (!emailEnabled) {
      console.log('\n🔧 Auto-fixing email settings...');
      
      // Update user settings
      user.notificationSettings = user.notificationSettings || {};
      user.notificationSettings.studyReminder = true;
      user.notificationSettings.dailyEmail = true;
      await user.save();
      
      // Update system settings
      settings.notification.email = true;
      await settings.save();
      
      console.log('✅ Email settings have been enabled!');
      console.log('📧 Test email will now be sent for upcoming sessions');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Summary:');
    console.log('   User has email:', user.email ? '✅' : '❌');
    console.log('   Email verified:', user.isEmailVerified ? '✅' : '❌');
    console.log('   Study reminder enabled:', user.notificationSettings?.studyReminder ? '✅' : '❌');
    console.log('   System email enabled:', settings.notification?.email ? '✅' : '❌');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkEmailSettings();
