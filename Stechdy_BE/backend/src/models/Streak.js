const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  lastActiveDate: {
    type: Date,
    required: [true, 'Last active date is required'],
    // Set to a very old date so first check-in is counted correctly
    default: () => new Date('2000-01-01T00:00:00.000Z')
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  streakHistory: [{
    date: {
      type: Date,
      required: true
    },
    activityCount: {
      type: Number,
      default: 1
    },
    isMakeup: {
      type: Boolean,
      default: false
    }
  }],
  totalActiveDays: {
    type: Number,
    default: 0,
    min: 0
  },
  makeupCheckIns: {
    monthlyLimit: {
      type: Number,
      default: 3
    },
    currentMonth: {
      type: String, // Format: "YYYY-MM"
      default: () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      }
    },
    usedThisMonth: {
      type: Number,
      default: 0,
      min: 0
    },
    history: [{
      date: Date,
      originalDate: Date,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  milestones: [{
    streak: {
      type: Number,
      required: true
    },
    animalId: {
      type: String,
      required: true
    },
    unlockedAt: Date,
    isUnlocked: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes (userId already has unique: true and index: true)
streakSchema.index({ currentStreak: -1 });
streakSchema.index({ longestStreak: -1 });

// Define milestone animals
const MILESTONE_ANIMALS = [
  { streak: 3, animalId: 'bunny', name: 'Cute Bunny', emoji: '🐰' },
  { streak: 7, animalId: 'fox', name: 'Clever Fox', emoji: '🦊' },
  { streak: 14, animalId: 'panda', name: 'Peaceful Panda', emoji: '🐼' },
  { streak: 21, animalId: 'koala', name: 'Sleepy Koala', emoji: '🐨' },
  { streak: 30, animalId: 'penguin', name: 'Happy Penguin', emoji: '🐧' },
  { streak: 45, animalId: 'dolphin', name: 'Smart Dolphin', emoji: '🐬' },
  { streak: 60, animalId: 'owl', name: 'Wise Owl', emoji: '🦉' },
  { streak: 90, animalId: 'dragon', name: 'Legendary Dragon', emoji: '🐉' },
  { streak: 180, animalId: 'unicorn', name: 'Magical Unicorn', emoji: '🦄' },
  { streak: 365, animalId: 'phoenix', name: 'Eternal Phoenix', emoji: '🔥' }
];

// Method to reset monthly makeup check-ins
streakSchema.methods.resetMonthlyMakeups = function() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  if (this.makeupCheckIns.currentMonth !== currentMonth) {
    this.makeupCheckIns.currentMonth = currentMonth;
    this.makeupCheckIns.usedThisMonth = 0;
  }
};

// Method to check and unlock milestones
streakSchema.methods.checkMilestones = function() {
  const newlyUnlocked = [];
  
  for (const milestone of MILESTONE_ANIMALS) {
    const existingMilestone = this.milestones.find(m => m.streak === milestone.streak);
    
    if (this.currentStreak >= milestone.streak) {
      if (!existingMilestone) {
        // New milestone unlocked
        this.milestones.push({
          streak: milestone.streak,
          animalId: milestone.animalId,
          unlockedAt: new Date(),
          isUnlocked: true
        });
        newlyUnlocked.push({ ...milestone, justUnlocked: true });
      } else if (!existingMilestone.isUnlocked) {
        // Unlock existing milestone
        existingMilestone.isUnlocked = true;
        existingMilestone.unlockedAt = new Date();
        newlyUnlocked.push({ ...milestone, justUnlocked: true });
      }
    } else {
      // Initialize locked milestone for display
      if (!existingMilestone) {
        this.milestones.push({
          streak: milestone.streak,
          animalId: milestone.animalId,
          isUnlocked: false
        });
      }
    }
  }
  
  return newlyUnlocked;
};

// Helper method to calculate longest streak from history
streakSchema.methods.calculateLongestStreak = function() {
  if (this.streakHistory.length === 0) return 0;
  
  // Remove duplicate dates - keep only unique dates (using UTC date components)
  const uniqueDates = new Map();
  this.streakHistory.forEach(entry => {
    const d = new Date(entry.date);
    // Use UTC date components to create unique key
    const dateKey = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    if (!uniqueDates.has(dateKey)) {
      uniqueDates.set(dateKey, entry);
    }
  });
  
  // Convert to array and sort by date
  const sortedHistory = Array.from(uniqueDates.values()).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  if (sortedHistory.length === 0) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedHistory.length; i++) {
    const prevDate = new Date(sortedHistory[i - 1].date);
    const currDate = new Date(sortedHistory[i].date);
    
    // Normalize to UTC midnight
    const prev = new Date(Date.UTC(prevDate.getUTCFullYear(), prevDate.getUTCMonth(), prevDate.getUTCDate()));
    const curr = new Date(Date.UTC(currDate.getUTCFullYear(), currDate.getUTCMonth(), currDate.getUTCDate()));
    
    const daysDiff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else if (daysDiff > 1) {
      // Streak broken, reset
      currentStreak = 1;
    }
    // daysDiff === 0 should not happen anymore due to uniqueDates filtering
  }
  
  return longestStreak;
};

// Method to update streak
streakSchema.methods.updateStreak = function(isMakeup = false, makeupDate = null) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  
  const checkInDate = makeupDate ? new Date(makeupDate) : today;
  // Normalize to UTC midnight
  const checkInDateUTC = new Date(Date.UTC(
    checkInDate.getUTCFullYear(), 
    checkInDate.getUTCMonth(), 
    checkInDate.getUTCDate(), 
    0, 0, 0, 0
  ));
  
  // Handle first-time check-in: if streakHistory is empty, this is the first entry
  const isFirstCheckIn = this.streakHistory.length === 0;
  
  const lastActive = new Date(this.lastActiveDate);
  const lastActiveUTC = new Date(Date.UTC(
    lastActive.getUTCFullYear(), 
    lastActive.getUTCMonth(), 
    lastActive.getUTCDate(), 
    0, 0, 0, 0
  ));
  
  const daysDiff = Math.floor((checkInDateUTC - lastActiveUTC) / (1000 * 60 * 60 * 24));
  
  // Check if already checked in for this date
  const alreadyCheckedIn = this.streakHistory.some(entry => {
    const entryDate = new Date(entry.date);
    const entryDateUTC = new Date(Date.UTC(
      entryDate.getUTCFullYear(), 
      entryDate.getUTCMonth(), 
      entryDate.getUTCDate(), 
      0, 0, 0, 0
    ));
    return entryDateUTC.getTime() === checkInDateUTC.getTime();
  });
  
  if (alreadyCheckedIn && !isMakeup) {
    // Same day, don't update streak
    return { updated: false };
  }
  
  // Add to history
  if (!alreadyCheckedIn) {
    this.streakHistory.push({ 
      date: checkInDateUTC, 
      activityCount: 1,
      isMakeup 
    });
    this.totalActiveDays += 1;
  }
  
  // Update last active date to the most recent date
  if (checkInDateUTC > lastActiveUTC || isFirstCheckIn) {
    this.lastActiveDate = checkInDateUTC;
  }
  
  // Recalculate current streak (consecutive days from TODAY backwards)
  console.log('=== Recalculating Streak ===');
  console.log('Total streakHistory entries:', this.streakHistory.length);
  console.log('Raw history:', this.streakHistory.map(h => ({
    date: h.date,
    isMakeup: h.isMakeup
  })));
  
  // First, remove duplicate dates - keep only unique dates (using UTC date components)
  const uniqueDates = new Map();
  this.streakHistory.forEach(entry => {
    const d = new Date(entry.date);
    // Use UTC date components to create unique key
    const dateKey = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    if (!uniqueDates.has(dateKey)) {
      uniqueDates.set(dateKey, entry);
    }
  });
  
  // Convert to array and sort (newest first)
  const sortedHistory = Array.from(uniqueDates.values()).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  console.log('Unique history count:', sortedHistory.length);
  console.log('Unique history dates:', sortedHistory.map(h => {
    const d = new Date(h.date);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }));
  
  if (sortedHistory.length === 0) {
    console.log('No history found');
    this.currentStreak = 0;
    console.log('=========================');
    return;
  }
  
  // Current streak should start from today or most recent check-in (UTC)
  // Reuse 'now' from the beginning of updateStreak function
  const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  
  console.log('Today UTC:', `${todayDate.getUTCFullYear()}-${String(todayDate.getUTCMonth() + 1).padStart(2, '0')}-${String(todayDate.getUTCDate()).padStart(2, '0')}`);
  
  // Find most recent check-in
  const mostRecentEntry = new Date(sortedHistory[0].date);
  const mostRecentDate = new Date(Date.UTC(
    mostRecentEntry.getUTCFullYear(), 
    mostRecentEntry.getUTCMonth(), 
    mostRecentEntry.getUTCDate(), 
    0, 0, 0, 0
  ));
  
  console.log('Most recent check-in:', `${mostRecentDate.getUTCFullYear()}-${String(mostRecentDate.getUTCMonth() + 1).padStart(2, '0')}-${String(mostRecentDate.getUTCDate()).padStart(2, '0')}`);
  
  // Calculate days since last check-in
  const daysSinceLastCheckIn = Math.floor((todayDate - mostRecentDate) / (1000 * 60 * 60 * 24));
  
  console.log('Days since last check-in:', daysSinceLastCheckIn);
  
  // Streak rules:
  // - If last check-in is today (daysSinceLastCheckIn = 0): streak continues
  // - If last check-in is yesterday (daysSinceLastCheckIn = 1): streak continues  
  // - If last check-in is 2+ days ago: streak is broken
  if (daysSinceLastCheckIn > 1) {
    console.log('Streak BROKEN - last check-in more than 1 day ago');
    this.currentStreak = 0;
  } else {
    console.log('Streak ACTIVE - counting consecutive days');
    // Start counting from most recent check-in
    this.currentStreak = 1;
    for (let i = 1; i < sortedHistory.length; i++) {
      const prevEntry = new Date(sortedHistory[i - 1].date);
      const currEntry = new Date(sortedHistory[i].date);
      
      // Normalize to UTC midnight
      const prevDate = new Date(Date.UTC(prevEntry.getUTCFullYear(), prevEntry.getUTCMonth(), prevEntry.getUTCDate()));
      const currDate = new Date(Date.UTC(currEntry.getUTCFullYear(), currEntry.getUTCMonth(), currEntry.getUTCDate()));
      
      const daysDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      const prevStr = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}-${String(prevDate.getUTCDate()).padStart(2, '0')}`;
      const currStr = `${currDate.getUTCFullYear()}-${String(currDate.getUTCMonth() + 1).padStart(2, '0')}-${String(currDate.getUTCDate()).padStart(2, '0')}`;
      console.log(`  Comparing ${prevStr} - ${currStr} = ${daysDiff} days`);
      
      if (daysDiff === 1) {
        this.currentStreak++;
        console.log(`  -> Consecutive! Streak now: ${this.currentStreak}`);
      } else {
        console.log(`  -> Gap found! Breaking at streak: ${this.currentStreak}`);
        break;
      }
    }
  }
  
  console.log('Final current streak:', this.currentStreak);
  console.log('=========================');
  
  // Calculate longest streak from entire history
  this.longestStreak = this.calculateLongestStreak();
  
  // Check for milestone unlocks
  const newlyUnlocked = this.checkMilestones();
  
  return { updated: true, newlyUnlocked };
};

// Static method to get milestone animals
streakSchema.statics.getMilestoneAnimals = function() {
  return MILESTONE_ANIMALS;
};

module.exports = mongoose.model('Streak', streakSchema);
