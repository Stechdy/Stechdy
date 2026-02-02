const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stechdy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Set user to premium
const setPremiumUser = async (email) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        premiumStatus: 'premium',
        premiumExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      { new: true }
    );

    if (user) {
      console.log('✅ User upgraded to premium:');
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎯 Name: ${user.name}`);
      console.log(`✨ Premium Status: ${user.premiumStatus}`);
      console.log(`📅 Expiry Date: ${user.premiumExpiryDate}`);
    } else {
      console.log('❌ User not found with email:', email);
    }
  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
};

// List all users with their premium status
const listUsers = async () => {
  try {
    const users = await User.find({}, 'name email premiumStatus premiumExpiryDate').sort({ createdAt: -1 });
    console.log('\n📋 All Users:');
    console.log('='.repeat(70));
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Status: ${user.premiumStatus} ${user.premiumStatus === 'premium' ? '✨' : '🆓'}`);
      if (user.premiumExpiryDate) {
        console.log(`   Expires: ${user.premiumExpiryDate.toLocaleDateString()}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Listing all users...\n');
    await listUsers();
  } else if (args[0] === 'premium' && args[1]) {
    console.log(`🚀 Setting user ${args[1]} to premium...\n`);
    await setPremiumUser(args[1]);
  } else {
    console.log('\nUsage:');
    console.log('  node test-premium-user.js                    # List all users');
    console.log('  node test-premium-user.js premium <email>    # Set user to premium');
    console.log('\nExamples:');
    console.log('  node test-premium-user.js premium user@example.com');
  }
  
  await mongoose.connection.close();
  console.log('\n👋 Connection closed');
};

main().catch(console.error);