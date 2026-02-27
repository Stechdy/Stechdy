require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('\n📧 Testing Email Configuration...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set (****)' : '❌ Missing');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('❌ Email credentials not configured in .env file');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log('🔍 Testing SMTP connection...');

// Verify connection
transporter.verify(async function(error, success) {
  if (error) {
    console.log('❌ SMTP Connection Failed:');
    console.log('   Error:', error.message);
    console.log('');
    console.log('💡 Common issues:');
    console.log('   - Incorrect email/password in .env');
    console.log('   - Not using App Password for Gmail');
    console.log('   - 2FA not enabled on Gmail account');
    console.log('   - Less secure app access not allowed');
    console.log('');
    console.log('🔧 For Gmail, you need to:');
    console.log('   1. Enable 2-Factor Authentication');
    console.log('   2. Generate an App Password');
    console.log('   3. Use the App Password in .env, not your regular password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  } else {
    console.log('✅ SMTP connection successful!\n');
    
    // Send test email
    console.log('📤 Sending test email to: tai05112004@gmail.com');
    
    const mailOptions = {
      from: `"Stechdy Test" <${process.env.EMAIL_USER}>`,
      to: 'tai05112004@gmail.com',
      subject: '🧪 Test Email - Stechdy Reminder System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">✅ Email System Working!</h1>
          </div>
          <div style="background: white; padding: 30px; margin-top: 20px; border-radius: 10px;">
            <h2>🎉 Test Successful</h2>
            <p>This email confirms that your Stechdy email reminder system is configured correctly.</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
            <hr>
            <p style="color: #666; font-size: 14px;">
              If you can see this email, your SMTP settings are working perfectly! 🚀
            </p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Test email sent successfully!');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📬 Check your inbox (and spam folder):');
      console.log('   Email: tai05112004@gmail.com');
      console.log('   Subject: 🧪 Test Email - Stechdy Reminder System');
      console.log('');
      console.log('✅ Email configuration is working!');
      console.log('   The reminder system should be able to send emails now.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(0);
    } catch (error) {
      console.log('❌ Failed to send test email:');
      console.log('   Error:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(1);
    }
  }
});
