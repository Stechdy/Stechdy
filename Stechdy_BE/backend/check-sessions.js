const mongoose = require('mongoose');
require('dotenv').config();
const { StudySessionSchedule } = require('./src/models');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Stechdy');
  
  const sessions = await StudySessionSchedule.find({ 
    date: { $gte: new Date('2026-01-01'), $lte: new Date('2026-01-12') } 
  }).limit(15);
  
  console.log('Sessions in Jan 2026:');
  sessions.forEach(s => {
    console.log(
      s.date.toISOString().split('T')[0], 
      '| status:', s.status, 
      '| actualDuration:', s.actualDuration || 'none'
    );
  });
  
  const completedCount = await StudySessionSchedule.countDocuments({
    date: { $gte: new Date('2026-01-01'), $lte: new Date('2026-01-12') },
    status: 'completed'
  });
  console.log('\nTotal completed sessions in Jan 1-12:', completedCount);
  
  await mongoose.disconnect();
}

check();
