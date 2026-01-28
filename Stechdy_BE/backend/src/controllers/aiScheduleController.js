const { 
  StudySessionSchedule, 
  StudyTimetable, 
  Subject, 
  Semester,
  AIInput,
  AIGenerationResult 
} = require('../models');

/**
 * Save AI generated schedule to database
 * This creates:
 * 1. Subjects (if not exist)
 * 2. StudyTimetable for each week
 * 3. StudySessionSchedule for each session
 * 4. AIInput to track the input
 * 5. AIGenerationResult to track the generation
 */
exports.saveAISchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    let { schedule, input, generated_at, message } = req.body;

    console.log('🤖 Saving AI generated schedule for user:', userId);
    console.log('📊 Schedule items:', schedule?.length);
    console.log('🔍 Input type:', typeof input);
    console.log('🔍 Input value:', JSON.stringify(input, null, 2));

    // Parse input if it's a string
    if (typeof input === 'string') {
      try {
        input = JSON.parse(input);
        console.log('✅ Parsed input from string');
      } catch (e) {
        console.log('⚠️ Failed to parse input string:', e.message);
      }
    }

    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule data. Expected array of schedule items.'
      });
    }

    // 1. Get or create active semester
    let semester = await Semester.findOne({ userId, isActive: true });
    
    if (!semester) {
      // Create a default semester if none exists
      const startDate = input?.start_date ? new Date(input.start_date) : new Date();
      const endDate = input?.end_date ? new Date(input.end_date) : new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000); // 4 months
      
      semester = await Semester.create({
        userId,
        name: `Semester ${new Date().getFullYear()}`,
        startDate,
        endDate,
        isActive: true,
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      });
      console.log('📚 Created new semester:', semester._id);
    }

    // 2. Create/find subjects from input
    const subjectMap = new Map(); // name -> Subject document
    
    if (input?.subjects && Array.isArray(input.subjects)) {
      for (const subjectData of input.subjects) {
        const subjectName = subjectData.name || subjectData;
        const priority = subjectData.priority || 3;
        
        // Map priority number to enum
        let priorityLevel = 'medium';
        if (priority >= 4) priorityLevel = 'high';
        else if (priority >= 5) priorityLevel = 'critical';
        else if (priority <= 2) priorityLevel = 'low';
        
        // Check if subject exists
        let subject = await Subject.findOne({
          userId,
          semesterId: semester._id,
          subjectName: { $regex: new RegExp(`^${subjectName}$`, 'i') }
        });
        
        if (!subject) {
          // Create new subject
          subject = await Subject.create({
            userId,
            semesterId: semester._id,
            subjectName,
            subjectCode: subjectName.substring(0, 6).toUpperCase(),
            priorityLevel,
            color: getSubjectColor(subjectMap.size)
          });
          console.log('📖 Created subject:', subject.subjectName);
        }
        
        subjectMap.set(subjectName.toLowerCase(), subject);
      }
    }

    // 3. Save AI Input - with safe handling of busy_times
    const safeBusySlots = [];
    if (input?.busy_times && Array.isArray(input.busy_times)) {
      for (const bt of input.busy_times) {
        // Only add if we have valid start_time and end_time
        if (bt.start_time && bt.end_time) {
          safeBusySlots.push({
            dayOfWeek: getDayOfWeekNumber(bt.day),
            startTime: bt.start_time,
            endTime: bt.end_time,
            type: bt.type || 'personal',
            recurring: true
          });
        }
      }
    }

    console.log('🔍 safeBusySlots length:', safeBusySlots.length);
    console.log('🔍 safeBusySlots is array:', Array.isArray(safeBusySlots));
    if (safeBusySlots.length > 0) {
      console.log('🔍 First busySlot:', safeBusySlots[0]);
      console.log('🔍 First busySlot type:', typeof safeBusySlots[0]);
    }

    // Create AI Input WITHOUT busySlots in structuredData to avoid validation issues
    const structuredDataObj = {
      subjects: input?.subjects?.map(s => ({
        name: typeof s === 'string' ? s : s.name,
        priority: typeof s === 'string' ? 'medium' : mapPriorityToString(s.priority)
      })) || [],
      preferences: {
        sessionDuration: input?.session_duration_hours ? input.session_duration_hours * 60 : 60,
        maxSessionsPerDay: 3
      }
      // Intentionally NOT including busySlots to avoid validation error
    };

    const aiInputData = {
      userId,
      semesterId: semester._id,
      inputType: 'fullContext',
      payload: {}, // Empty payload to avoid any stringification issues
      status: 'processed',
      structuredData: structuredDataObj,
      metadata: {
        source: 'api',
        processedAt: new Date(),
        originalInput: input, // Store original input in metadata instead
        busyTimesCount: safeBusySlots.length // Track busy times without storing in structuredData
      }
    };

    console.log('🔍 Creating AIInput without busySlots in structuredData');

    const aiInput = new AIInput(aiInputData);
    await aiInput.save();
    console.log('📝 Created AI Input:', aiInput._id);

    // 4. Group schedule by week and create timetables + sessions
    const weeklyGroups = groupScheduleByWeek(schedule);
    console.log('📅 Weekly groups count:', weeklyGroups.size);
    console.log('📅 Weekly groups keys:', Array.from(weeklyGroups.keys()));
    
    const createdSessions = [];
    const createdTimetables = [];
    
    for (const [weekKey, weekSessions] of weeklyGroups.entries()) {
      const weekStart = getWeekStart(weekSessions[0].date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // Check if timetable exists for this week
      const weekStartRangeStart = new Date(weekStart);
      weekStartRangeStart.setHours(0, 0, 0, 0);
      const weekStartRangeEnd = new Date(weekStart);
      weekStartRangeEnd.setHours(23, 59, 59, 999);
      
      let timetable = await StudyTimetable.findOne({
        userId,
        semesterId: semester._id,
        weekStartDate: {
          $gte: weekStartRangeStart,
          $lte: weekStartRangeEnd
        }
      });
      
      if (!timetable) {
        // Create new timetable
        timetable = await StudyTimetable.create({
          userId,
          semesterId: semester._id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          generatedBy: 'AI',
          status: 'active',
          version: 1,
          metadata: {
            totalSessions: weekSessions.length,
            generationDate: new Date()
          }
        });
        createdTimetables.push(timetable);
        console.log('📅 Created timetable for week:', weekKey);
      }
      
      // Create sessions for this week
      for (const sessionData of weekSessions) {
        const subjectName = sessionData.subject || sessionData.subject_code || 'Study';
        let subject = subjectMap.get(subjectName.toLowerCase());
        
        // Create subject if not found
        if (!subject) {
          subject = await Subject.findOne({
            userId,
            semesterId: semester._id,
            subjectName: { $regex: new RegExp(`^${subjectName}$`, 'i') }
          });
          
          if (!subject) {
            subject = await Subject.create({
              userId,
              semesterId: semester._id,
              subjectName,
              subjectCode: subjectName.substring(0, 6).toUpperCase(),
              priorityLevel: 'medium',
              color: getSubjectColor(subjectMap.size)
            });
            subjectMap.set(subjectName.toLowerCase(), subject);
          }
        }
        
        const sessionDate = new Date(sessionData.date);
        const dayOfWeek = sessionDate.getDay();
        
        // Determine session type based on start time
        const sessionType = getSessionType(sessionData.start_time);
        
        // Check if session already exists (avoid duplicates)
        const existingSession = await StudySessionSchedule.findOne({
          userId,
          timetableId: timetable._id,
          subjectId: subject._id,
          date: sessionDate,
          startTime: sessionData.start_time
        });
        
        if (!existingSession) {
          const session = await StudySessionSchedule.create({
            timetableId: timetable._id,
            userId,
            subjectId: subject._id,
            date: sessionDate,
            dayOfWeek,
            sessionType,
            startTime: sessionData.start_time,
            endTime: sessionData.end_time,
            status: sessionData.status || 'scheduled',
            isUserEdited: false
          });
          createdSessions.push(session);
        }
      }
      
      // Update timetable totals
      await timetable.calculateTotalHours();
    }

    // 5. Create AI Generation Result
    const aiGenerationResult = await AIGenerationResult.create({
      userId,
      semesterId: semester._id,
      aiInputId: aiInput._id,
      generationPrompt: JSON.stringify(input),
      aiResponse: { schedule, generated_at, message },
      status: 'success',
      wasApplied: true,
      appliedAt: new Date(),
      confidenceScore: 85,
      generatedSchedule: {
        totalStudyHours: createdSessions.length * (input?.session_duration_hours || 1),
        subjectDistribution: Array.from(subjectMap.values()).map(subject => ({
          subjectId: subject._id,
          subjectName: subject.subjectName,
          sessionsCount: createdSessions.filter(s => s.subjectId.toString() === subject._id.toString()).length
        }))
      },
      metadata: {
        generationTime: Date.now(),
        version: '1.0'
      }
    });
    console.log('✨ Created AI Generation Result:', aiGenerationResult._id);

    console.log(`✅ Successfully saved schedule: ${createdSessions.length} sessions, ${createdTimetables.length} timetables`);

    res.status(201).json({
      success: true,
      message: 'Schedule saved successfully',
      data: {
        semesterId: semester._id,
        aiInputId: aiInput._id,
        aiGenerationResultId: aiGenerationResult._id,
        timetablesCreated: createdTimetables.length,
        sessionsCreated: createdSessions.length,
        subjectsCreated: subjectMap.size
      }
    });

  } catch (error) {
    console.error('❌ Error saving AI schedule:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to save schedule',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get AI generated schedules for current user
 */
exports.getAISchedules = async (req, res) => {
  try {
    const userId = req.user._id;
    const { semesterId, startDate, endDate } = req.query;

    console.log('📚 Fetching AI schedules for user:', userId);

    // Build query
    const query = { userId };
    
    if (semesterId) {
      query.semesterId = semesterId;
    }

    // Get AI generation results
    const generations = await AIGenerationResult.find(query)
      .populate('semesterId', 'name startDate endDate')
      .populate('aiInputId', 'inputType payload')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get sessions for date range
    const sessionsQuery = { userId };
    
    if (startDate && endDate) {
      sessionsQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await StudySessionSchedule.find(sessionsQuery)
      .populate('subjectId', 'subjectName color subjectCode')
      .populate('timetableId', 'weekStartDate weekEndDate status')
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Group sessions by date
    const scheduleByDate = {};
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = {
          date: dateKey,
          day_of_week: getDayName(new Date(session.date).getDay()),
          sessions: []
        };
      }
      scheduleByDate[dateKey].sessions.push({
        _id: session._id,
        subject: session.subjectId?.subjectName || 'Unknown',
        subject_code: session.subjectId?.subjectCode,
        color: session.subjectId?.color,
        start_time: session.startTime,
        end_time: session.endTime,
        status: session.status,
        session_no: scheduleByDate[dateKey].sessions.length + 1
      });
    });

    res.json({
      success: true,
      data: {
        generations,
        schedule: Object.values(scheduleByDate)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching AI schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules',
      error: error.message
    });
  }
};

/**
 * Delete AI generated schedule
 */
exports.deleteAISchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { generationId } = req.params;

    console.log('🗑️ Deleting AI schedule:', generationId);

    const generation = await AIGenerationResult.findOne({
      _id: generationId,
      userId
    });

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'AI generation not found'
      });
    }

    // Delete related timetables and sessions
    const timetables = await StudyTimetable.find({
      userId,
      aiGenerationId: generationId
    });

    for (const timetable of timetables) {
      await StudySessionSchedule.deleteMany({ timetableId: timetable._id });
      await timetable.deleteOne();
    }

    // Delete AI input
    if (generation.aiInputId) {
      await AIInput.findByIdAndDelete(generation.aiInputId);
    }

    // Delete the generation result
    await generation.deleteOne();

    console.log('✅ Successfully deleted AI schedule');

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting AI schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule',
      error: error.message
    });
  }
};

// Helper functions

function getSubjectColor(index) {
  const colors = [
    '#5bbec8', '#f472b6', '#fbbf24', '#34d399',
    '#a78bfa', '#fb923c', '#60a5fa', '#f87171',
    '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'
  ];
  return colors[index % colors.length];
}

function mapPriorityToString(priority) {
  if (priority >= 5) return 'critical';
  if (priority >= 4) return 'high';
  if (priority >= 3) return 'medium';
  return 'low';
}

function getDayOfWeekNumber(dayName) {
  const days = {
    'sunday': 0, 'sun': 0,
    'monday': 1, 'mon': 1,
    'tuesday': 2, 'tue': 2,
    'wednesday': 3, 'wed': 3,
    'thursday': 4, 'thu': 4,
    'friday': 5, 'fri': 5,
    'saturday': 6, 'sat': 6
  };
  return days[dayName?.toLowerCase()] ?? 0;
}

function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Unknown';
}

function getSessionType(startTime) {
  if (!startTime) return 'morning';
  const hour = parseInt(startTime.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getWeekStart(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function groupScheduleByWeek(schedule) {
  const weeklyGroups = new Map();
  
  // First, flatten schedule if it contains date/sessions structure
  let flatSessions = [];
  
  console.log('🔍 Grouping schedule, input length:', schedule?.length);
  console.log('🔍 First schedule item:', JSON.stringify(schedule?.[0], null, 2));
  
  schedule.forEach(item => {
    if (item.date && item.sessions && Array.isArray(item.sessions)) {
      // Format: {date: "2026-01-19", sessions: [...]}
      console.log('📋 Processing date item:', item.date, 'with', item.sessions.length, 'sessions');
      item.sessions.forEach(session => {
        flatSessions.push({
          ...session,
          date: item.date
        });
      });
    } else if (item.date && item.start_time) {
      // Format: {date: "2026-01-19", start_time: "08:00", ...}
      console.log('📋 Processing flat session:', item.date, item.start_time);
      flatSessions.push(item);
    }
  });
  
  console.log('🔍 Total flat sessions:', flatSessions.length);
  if (flatSessions.length > 0) {
    console.log('🔍 First flat session:', JSON.stringify(flatSessions[0], null, 2));
  }
  
  // Group by week
  flatSessions.forEach(session => {
    const weekStart = getWeekStart(session.date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, []);
    }
    weeklyGroups.get(weekKey).push(session);
  });
  
  return weeklyGroups;
}

module.exports = exports;
