#!/usr/bin/env node

console.log('\n🔍 STECHDY EMAIL REMINDER SYSTEM - COMPREHENSIVE CHECK\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const { spawn } = require('child_process');
const path = require('path');

function runScript(scriptName, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}\n`);
    
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAllChecks() {
  try {
    // 1. Check email settings
    await runScript('check-email-settings.js', 'Step 1: Checking email notification settings');
    
    // 2. Debug current sessions
    await runScript('debug-sessions.js', 'Step 2: Checking scheduled sessions');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL CHECKS COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📝 NEXT STEPS:\n');
    console.log('   1️⃣  If no sessions in reminder window (14-16 min):');
    console.log('      Run: node test-session.js');
    console.log('');
    console.log('   2️⃣  Start the server:');
    console.log('      Run: npm start');
    console.log('');
    console.log('   3️⃣  Monitor the logs for:');
    console.log('      - "📧 Reminder sent for session..."');
    console.log('      - "Running study session reminder check..." (every minute)');
    console.log('');
    console.log('   4️⃣  Check email inbox around 15 minutes before session');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🐛 TROUBLESHOOTING:\n');
    console.log('   ❌ No email received?');
    console.log('      - Check spam folder');
    console.log('      - Verify SMTP settings in .env file');
    console.log('      - Check server logs for errors');
    console.log('      - Ensure session is 14-16 minutes away');
    console.log('');
    console.log('   ❌ Scheduler not running?');
    console.log('      - Check server.js imports sessionReminderService');
    console.log('      - Look for "Session reminder scheduler initialized"');
    console.log('      - Check for "Checking for reminders every minute"');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error during checks:', error.message);
    process.exit(1);
  }
}

runAllChecks();
