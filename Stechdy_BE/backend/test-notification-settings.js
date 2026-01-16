/**
 * Script kiểm tra notification settings
 * Chạy: node test-notification-settings.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Settings = require('./src/models/Settings');

async function testNotificationSettings() {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Lấy user đầu tiên (hoặc thay bằng user ID cụ thể)
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found');
      return;
    }

    console.log('=== USER INFORMATION ===');
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`ID: ${user._id}\n`);

    // Kiểm tra User notification settings
    console.log('=== USER.NOTIFICATION_SETTINGS ===');
    console.log(JSON.stringify(user.notificationSettings, null, 2));
    console.log();

    // Kiểm tra Settings
    let settings = await Settings.findOne({ userId: user._id });
    
    if (!settings) {
      console.log('⚠️  Settings not found, creating default...');
      settings = await Settings.create({ userId: user._id });
    }

    console.log('=== SETTINGS.NOTIFICATION ===');
    console.log(JSON.stringify(settings.notification, null, 2));
    console.log();

    // Kiểm tra logic email
    console.log('=== EMAIL NOTIFICATION LOGIC ===');
    const emailMasterSwitch = settings.notification.email;
    const dailyEmailSetting = user.notificationSettings.dailyEmail;
    const finalEmailEnabled = emailMasterSwitch && dailyEmailSetting;

    console.log(`Settings.notification.email: ${emailMasterSwitch ? '✅ ON' : '❌ OFF'}`);
    console.log(`User.notificationSettings.dailyEmail: ${dailyEmailSetting ? '✅ ON' : '❌ OFF'}`);
    console.log(`Final Result (Both must be ON): ${finalEmailEnabled ? '✅ SEND EMAIL' : '❌ NO EMAIL'}\n`);

    // Test cases
    console.log('=== TEST SCENARIOS ===');
    
    console.log('\n📧 Scenario 1: Both ON (Should send email)');
    console.log(`  Settings.email: true + User.dailyEmail: true`);
    console.log(`  Result: ${true && true ? '✅ SEND' : '❌ SKIP'}`);
    
    console.log('\n📧 Scenario 2: Settings OFF (Should NOT send)');
    console.log(`  Settings.email: false + User.dailyEmail: true`);
    console.log(`  Result: ${false && true ? '✅ SEND' : '❌ SKIP'}`);
    
    console.log('\n📧 Scenario 3: User OFF (Should NOT send)');
    console.log(`  Settings.email: true + User.dailyEmail: false`);
    console.log(`  Result: ${true && false ? '✅ SEND' : '❌ SKIP'}`);
    
    console.log('\n📧 Scenario 4: Both OFF (Should NOT send)');
    console.log(`  Settings.email: false + User.dailyEmail: false`);
    console.log(`  Result: ${false && false ? '✅ SEND' : '❌ SKIP'}`);

    // Recommendations
    console.log('\n=== RECOMMENDATIONS ===');
    if (!emailMasterSwitch) {
      console.log('⚠️  ISSUE: Settings.notification.email is OFF');
      console.log('   User will NOT receive any notification emails');
      console.log('   Even if specific notification types are ON\n');
      console.log('   To fix: Update Settings.notification.email to true');
      console.log('   API: PUT /api/users/settings');
      console.log('   Body: { "notification": { "email": true } }');
    } else {
      console.log('✅ Settings.notification.email is ON - emails can be sent');
    }

    if (!dailyEmailSetting) {
      console.log('\n⚠️  INFO: User.notificationSettings.dailyEmail is OFF');
      console.log('   User preferences: No daily email reminders');
    }

    // Test with all users
    console.log('\n\n=== ALL USERS EMAIL SETTINGS ===');
    const allUsers = await User.find().limit(10);
    console.log(`Checking first ${allUsers.length} users...\n`);

    for (const u of allUsers) {
      const s = await Settings.findOne({ userId: u._id });
      const emailEnabled = s?.notification?.email && u.notificationSettings?.dailyEmail;
      
      console.log(`${emailEnabled ? '✅' : '❌'} ${u.name} (${u.email})`);
      console.log(`   Settings.email: ${s?.notification?.email ?? 'N/A'}, User.dailyEmail: ${u.notificationSettings?.dailyEmail ?? 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
testNotificationSettings();
