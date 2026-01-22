const MoodTracking = require('../models/MoodTracking');
const Gamification = require('../models/Gamification');
const Streak = require('../models/Streak');
const AIMoodInsight = require('../models/AIMoodInsight');

// @desc    Create mood tracking entry (Daily Check-in)
// @route   POST /api/moods
// @access  Private
exports.createMoodEntry = async (req, res) => {
  try {
    const { mood, emotionTags, note, energyLevel } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn tâm trạng (1-5)'
      });
    }

    // Check if mood entry already exists for today (UTC timezone)
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log('createMoodEntry - Checking existing mood for today');
    console.log('createMoodEntry - startOfDay:', startOfDay.toISOString());
    console.log('createMoodEntry - endOfDay:', endOfDay.toISOString());
    console.log('createMoodEntry - userId:', userId);

    const existingMood = await MoodTracking.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    console.log('createMoodEntry - existingMood found:', !!existingMood);
    if (existingMood) {
      console.log('createMoodEntry - existing mood date:', existingMood.date);
    }

    if (existingMood) {
      // Update existing mood entry
      existingMood.mood = mood;
      existingMood.emotionTags = emotionTags || [];
      existingMood.note = note || '';
      existingMood.energyLevel = energyLevel || 5;
      await existingMood.save();

      console.log('createMoodEntry - Updated existing mood');

      return res.status(200).json({
        success: true,
        message: 'Đã cập nhật cảm xúc hôm nay 💙',
        data: existingMood
      });
    }

    // Create new mood entry with UTC timezone
    const moodEntry = await MoodTracking.create({
      userId,
      mood,
      emotionTags: emotionTags || [],
      note: note || '',
      energyLevel: energyLevel || 5,
      date: today
    });

    console.log('createMoodEntry - Created new mood entry');
    console.log('createMoodEntry - new mood date:', moodEntry.date.toISOString());

    // Update Gamification: Add XP for mood check-in
    let gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      gamification = await Gamification.create({ userId });
    }
    
    gamification.addXP(10, 'Mood check-in hôm nay');
    await gamification.save();

    // Update Streak
    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = await Streak.create({ userId });
    }
    
    // Reset monthly makeups if new month
    streak.resetMonthlyMakeups();
    
    // Pass today date to updateStreak to ensure consistency
    const streakUpdate = streak.updateStreak(false, today);
    await streak.save();

    // Check for "Self-aware Learner" badge (7 consecutive days)
    if (streak.currentStreak >= 7) {
      const hasBadge = gamification.badges.some(b => b.name === 'Self-aware Learner');
      if (!hasBadge) {
        gamification.badges.push({
          name: 'Self-aware Learner',
          description: 'Check-in cảm xúc 7 ngày liên tiếp',
          earnedAt: new Date()
        });
        gamification.addXP(50, 'Earned "Self-aware Learner" badge');
        await gamification.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Đã lưu cảm xúc hôm nay 💙',
      data: {
        mood: moodEntry,
        xpGained: 10,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        newBadge: streak.currentStreak === 7 ? 'Self-aware Learner' : null,
        newMilestones: streakUpdate?.newlyUnlocked || []
      }
    });

  } catch (error) {
    console.error('Create mood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu cảm xúc',
      error: error.message
    });
  }
};

// @desc    Get mood entries with optional date range
// @route   GET /api/moods
// @access  Private
exports.getMoodEntries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, limit = 30 } = req.query;

    const query = { userId };

    // Apply date filters if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    console.log('getMoodEntries - userId:', userId);
    console.log('getMoodEntries - query:', JSON.stringify(query));
    console.log('getMoodEntries - limit:', limit);
    console.log('getMoodEntries - startDate:', startDate);
    console.log('getMoodEntries - endDate:', endDate);

    // Check total moods for user first
    const totalMoods = await MoodTracking.countDocuments({ userId });
    console.log('getMoodEntries - TOTAL moods for user in DB:', totalMoods);

    const moods = await MoodTracking.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('aiInsight');

    console.log('getMoodEntries - found moods count:', moods.length);
    console.log('getMoodEntries - mood details:', moods.map(m => ({
      id: m._id,
      date: m.date,
      mood: m.mood,
      energyLevel: m.energyLevel
    })));

    res.status(200).json({
      success: true,
      count: moods.length,
      data: moods
    });

  } catch (error) {
    console.error('Get mood entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu cảm xúc',
      error: error.message
    });
  }
};

// @desc    Get today's mood entry
// @route   GET /api/moods/today
// @access  Private
exports.getTodayMood = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Vietnam timezone (UTC+7)
    const now = new Date();
    const vietnamOffset = 7 * 60;
    const localTime = new Date(now.getTime() + vietnamOffset * 60 * 1000);
    
    const startOfDay = new Date(localTime);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(localTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const todayMood = await MoodTracking.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('aiInsight');

    res.status(200).json({
      success: true,
      data: todayMood
    });

  } catch (error) {
    console.error('Get today mood error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cảm xúc hôm nay',
      error: error.message
    });
  }
};

// @desc    Get mood by specific date
// @route   GET /api/moods/date/:date
// @access  Private
exports.getMoodByDate = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.params;

    // Parse date and adjust for Vietnam timezone
    const targetDate = new Date(date);
    const vietnamOffset = 7 * 60;
    const localTime = new Date(targetDate.getTime() + vietnamOffset * 60 * 1000);
    
    const startOfDay = new Date(localTime);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(localTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const moodEntry = await MoodTracking.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('aiInsight');

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Không có dữ liệu cảm xúc cho ngày này'
      });
    }

    res.status(200).json({
      success: true,
      data: moodEntry
    });

  } catch (error) {
    console.error('Get mood by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cảm xúc',
      error: error.message
    });
  }
};

// @desc    Get mood statistics
// @route   GET /api/moods/stats
// @access  Private
exports.getMoodStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    console.log('getMoodStats - userId:', userId);
    console.log('getMoodStats - startDate:', startDate);

    // First, let's see ALL mood entries for this user
    const allMoods = await MoodTracking.find({ userId });
    console.log('getMoodStats - TOTAL moods in DB for user:', allMoods.length);
    console.log('getMoodStats - ALL mood dates:', allMoods.map(m => ({
      id: m._id,
      date: m.date,
      mood: m.mood
    })));

    const moods = await MoodTracking.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    console.log('getMoodStats - found moods count (filtered):', moods.length);
    console.log('getMoodStats - filtered mood dates:', moods.map(m => ({
      id: m._id,
      date: m.date,
      mood: m.mood
    })));

    // Calculate statistics
    const totalEntries = moods.length;
    const avgMood = totalEntries > 0 
      ? (moods.reduce((sum, m) => sum + m.mood, 0) / totalEntries).toFixed(2)
      : 0;
    
    const avgEnergy = totalEntries > 0
      ? (moods.reduce((sum, m) => sum + (m.energyLevel || 5), 0) / totalEntries).toFixed(2)
      : 0;

    // Mood distribution
    const moodDistribution = {
      1: moods.filter(m => m.mood === 1).length,
      2: moods.filter(m => m.mood === 2).length,
      3: moods.filter(m => m.mood === 3).length,
      4: moods.filter(m => m.mood === 4).length,
      5: moods.filter(m => m.mood === 5).length,
    };

    // Most common emotions
    const emotionCount = {};
    moods.forEach(m => {
      m.emotionTags.forEach(tag => {
        emotionCount[tag] = (emotionCount[tag] || 0) + 1;
      });
    });
    
    const topEmotions = Object.entries(emotionCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    res.status(200).json({
      success: true,
      data: {
        totalEntries,
        avgMood: parseFloat(avgMood),
        avgEnergy: parseFloat(avgEnergy),
        moodDistribution,
        topEmotions,
        period: `Last ${days} days`
      }
    });

  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê cảm xúc',
      error: error.message
    });
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/moods/:id
// @access  Private
exports.deleteMoodEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const moodEntry = await MoodTracking.findOne({ _id: id, userId });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu cảm xúc'
      });
    }

    await moodEntry.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa dữ liệu cảm xúc'
    });

  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa cảm xúc',
      error: error.message
    });
  }
};

// @desc    Generate AI mood insight
// @route   POST /api/moods/:id/insight
// @access  Private
exports.generateMoodInsight = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const moodEntry = await MoodTracking.findOne({ _id: id, userId });

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu cảm xúc'
      });
    }

    // Get recent mood entries for pattern analysis
    const recentMoods = await MoodTracking.find({ userId })
      .sort({ date: -1 })
      .limit(7);

    // Simple AI insight generation (can be enhanced with real AI later)
    const avgRecentMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
    
    let insightText = '';
    let behaviorPattern = '';
    let recommendations = [];
    let confidenceScore = 0.7;

    if (avgRecentMood >= 4) {
      insightText = 'Tâm trạng của bạn trong thời gian gần đây rất tích cực! Hãy tiếp tục duy trì lối sống lành mạnh.';
      behaviorPattern = 'Positive trend';
      recommendations = [
        'Tiếp tục duy trì thói quen học tập hiện tại',
        'Chia sẻ năng lượng tích cực với bạn bè',
        'Đặt mục tiêu mới để thử thách bản thân'
      ];
    } else if (avgRecentMood >= 3) {
      insightText = 'Tâm trạng của bạn khá ổn định. Hãy chú ý đến sức khỏe tinh thần của mình.';
      behaviorPattern = 'Stable mood';
      recommendations = [
        'Dành thời gian thư giãn mỗi ngày',
        'Tập thể dục nhẹ nhàng',
        'Kết nối với người thân yêu'
      ];
    } else {
      insightText = 'Có vẻ như bạn đang gặp một số khó khăn. Đừng ngần ngại tìm kiếm sự hỗ trợ.';
      behaviorPattern = 'Needs attention';
      recommendations = [
        'Nói chuyện với người bạn tin tưởng',
        'Nghỉ ngơi và chăm sóc bản thân',
        'Xem xét giảm bớt áp lực học tập',
        'Tìm kiếm sự hỗ trợ chuyên nghiệp nếu cần'
      ];
    }

    // Create or update AI insight
    const insight = await AIMoodInsight.findOneAndUpdate(
      { moodId: id },
      {
        userId,
        moodId: id,
        insightText,
        behaviorPattern,
        recommendations,
        confidenceScore,
        generatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Đã tạo phân tích cảm xúc',
      data: insight
    });

  } catch (error) {
    console.error('Generate mood insight error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phân tích cảm xúc',
      error: error.message
    });
  }
};

// @desc    Makeup mood check-in for missed day
// @route   POST /api/moods/makeup
// @access  Private
exports.makeupMoodCheckIn = async (req, res) => {
  try {
    const { date, mood, emotionTags, note, energyLevel } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ngày cần điểm danh bù'
      });
    }

    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn tâm trạng (1-5)'
      });
    }

    // Parse the date - handle YYYY-MM-DD format to avoid timezone issues
    // Input format: "2026-01-20"
    let makeupDate;
    if (date.includes('T')) {
      // ISO string format
      makeupDate = new Date(date);
    } else {
      // YYYY-MM-DD format - parse as UTC date at midnight
      // This ensures the date is stored correctly in database
      const [year, month, day] = date.split('-').map(Number);
      // Create UTC date: YYYY-MM-DDT00:00:00.000Z
      makeupDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    }
    
    console.log('Parsed makeup date:', makeupDate);
    console.log('Makeup date ISO:', makeupDate.toISOString());
    
    // Get today at midnight UTC
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
    
    console.log('Today UTC:', todayUTC.toISOString());
    
    // Validate that makeup date is in the past (not today or future)
    if (makeupDate >= todayUTC) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể điểm danh bù cho các ngày trong quá khứ'
      });
    }
    
    const now = new Date();

    // Check streak and makeup availability
    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = await Streak.create({ userId });
    }

    // Reset monthly makeups if new month
    streak.resetMonthlyMakeups();

    // Check if user has makeup check-ins left this month
    if (streak.makeupCheckIns.usedThisMonth >= streak.makeupCheckIns.monthlyLimit) {
      return res.status(400).json({
        success: false,
        message: `Bạn đã sử dụng hết ${streak.makeupCheckIns.monthlyLimit} lần điểm danh bù trong tháng này`,
        remainingMakeups: 0
      });
    }

    // Check if already checked in for the makeup date
    // Create start and end of day boundaries in UTC
    const startOfMakeupDay = new Date(makeupDate);
    startOfMakeupDay.setUTCHours(0, 0, 0, 0);
    const endOfMakeupDay = new Date(makeupDate);
    endOfMakeupDay.setUTCHours(23, 59, 59, 999);

    console.log('Checking existing mood for date range:', {
      start: startOfMakeupDay.toISOString(),
      end: endOfMakeupDay.toISOString(),
      makeupDate: makeupDate.toISOString()
    });

    const existingMood = await MoodTracking.findOne({
      userId,
      date: { $gte: startOfMakeupDay, $lte: endOfMakeupDay }
    });
    
    console.log('Existing mood found:', existingMood ? 'YES' : 'NO');

    if (existingMood) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã điểm danh cho ngày này rồi'
      });
    }

    // Create makeup mood entry
    const moodEntry = await MoodTracking.create({
      userId,
      mood,
      emotionTags: emotionTags || [],
      note: note || '',
      energyLevel: energyLevel || 5,
      date: makeupDate
    });

    // Update streak with makeup
    const streakUpdate = streak.updateStreak(true, makeupDate);
    
    // Record makeup usage
    streak.makeupCheckIns.usedThisMonth += 1;
    streak.makeupCheckIns.history.push({
      date: makeupDate,
      originalDate: now
    });
    
    await streak.save();

    // Update Gamification: Add XP for makeup check-in (less than regular)
    let gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      gamification = await Gamification.create({ userId });
    }
    
    gamification.addXP(5, 'Điểm danh bù mood');
    await gamification.save();

    const remainingMakeups = streak.makeupCheckIns.monthlyLimit - streak.makeupCheckIns.usedThisMonth;

    res.status(201).json({
      success: true,
      message: `Đã điểm danh bù thành công! Còn ${remainingMakeups} lần điểm danh bù trong tháng này`,
      data: {
        mood: moodEntry,
        xpGained: 5,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        remainingMakeups,
        newMilestones: streakUpdate?.newlyUnlocked || []
      }
    });

  } catch (error) {
    console.error('Makeup mood check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi điểm danh bù',
      error: error.message
    });
  }
};

// @desc    Get streak info with milestones
// @route   GET /api/moods/streak
// @access  Private
exports.getStreakInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = await Streak.create({ userId });
      await streak.save();
    }

    // Reset monthly makeups if new month
    streak.resetMonthlyMakeups();
    
    // Initialize milestones
    streak.checkMilestones();
    await streak.save();

    // Get all milestone animals
    const allMilestones = Streak.getMilestoneAnimals();
    
    // Merge with user's unlocked milestones
    const milestonesWithStatus = allMilestones.map(milestone => {
      const userMilestone = streak.milestones.find(m => m.streak === milestone.streak);
      return {
        ...milestone,
        isUnlocked: userMilestone?.isUnlocked || false,
        unlockedAt: userMilestone?.unlockedAt || null,
        progress: Math.min(100, (streak.currentStreak / milestone.streak) * 100)
      };
    });

    const remainingMakeups = streak.makeupCheckIns.monthlyLimit - streak.makeupCheckIns.usedThisMonth;

    res.status(200).json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        totalActiveDays: streak.totalActiveDays,
        lastActiveDate: streak.lastActiveDate,
        makeupCheckIns: {
          monthlyLimit: streak.makeupCheckIns.monthlyLimit,
          usedThisMonth: streak.makeupCheckIns.usedThisMonth,
          remainingMakeups
        },
        milestones: milestonesWithStatus,
        nextMilestone: milestonesWithStatus.find(m => !m.isUnlocked)
      }
    });

  } catch (error) {
    console.error('Get streak info error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin streak',
      error: error.message
    });
  }
};
