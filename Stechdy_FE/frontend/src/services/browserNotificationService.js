class BrowserNotificationService {
  constructor() {
    this.permission = null;
    this.checkPermission();
  }

  // Check if notifications are supported and permission status
  checkPermission() {
    if (!('Notification' in window)) {
      return false;
    }
    this.permission = Notification.permission;
    return this.permission === 'granted';
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }

  // Show a notification
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      return null;
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      this.handleNotificationClick(notification);
      return notification;
    } catch (error) {
      return null;
    }
  }

  // Schedule streak reminder notification
  scheduleStreakReminder(currentStreak, hoursUntilReset = 2) {
    const messages = [
      {
        title: '🔥 Streak sắp mất!',
        body: `Bạn đang có ${currentStreak} ngày streak. Đừng quên điểm danh mood hôm nay!`,
        tag: 'streak-reminder'
      },
      {
        title: '💙 Nhớ ghi nhận tâm trạng nhé!',
        body: `Còn ${hoursUntilReset} giờ nữa là hết ngày. Duy trì streak ${currentStreak} ngày của bạn!`,
        tag: 'streak-reminder'
      },
      {
        title: `✨ Streak ${currentStreak} ngày!`,
        body: 'Hãy dành vài giây để check-in mood trước khi ngày kết thúc.',
        tag: 'streak-reminder'
      }
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return this.showNotification(randomMessage.title, {
      body: randomMessage.body,
      tag: randomMessage.tag,
      data: {
        url: '/mood',
        type: 'streak-reminder'
      }
    });
  }

  // Notify when milestone is unlocked
  notifyMilestoneUnlocked(milestone) {
    return this.showNotification('🎉 Phần thưởng mới!', {
      body: `Chúc mừng! Bạn đã mở khóa ${milestone.emoji} ${milestone.name}`,
      tag: 'milestone-unlocked',
      requireInteraction: true,
      data: {
        url: '/mood/history',
        type: 'milestone-unlocked',
        milestoneId: milestone.animalId
      }
    });
  }

  // Setup automatic streak reminders
  setupStreakReminders(streakData) {
    // Check if user has already checked in today
    const now = new Date();
    const lastActiveDate = new Date(streakData.lastActiveDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());

    const hasCheckedInToday = today.getTime() === lastActive.getTime();

    if (hasCheckedInToday) {
      // Already checked in today, no need for reminder
      return;
    }

    // Calculate hours until end of day
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const hoursUntilReset = Math.ceil((endOfDay - now) / (1000 * 60 * 60));

    // Show reminder if it's getting close to end of day (within 4 hours)
    if (hoursUntilReset <= 4 && streakData.currentStreak > 0) {
      this.scheduleStreakReminder(streakData.currentStreak, hoursUntilReset);
    }

    // Setup periodic check every hour
    const intervalId = setInterval(() => {
      const currentHour = new Date().getHours();
      // Remind at 8 PM (20:00) if not checked in yet
      if (currentHour === 20) {
        this.scheduleStreakReminder(streakData.currentStreak, 4);
      }
    }, 60 * 60 * 1000); // Check every hour

    // Store interval ID to clear later if needed
    this.reminderIntervalId = intervalId;
  }

  // Clear streak reminders
  clearStreakReminders() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  }

  // Handle notification clicks
  handleNotificationClick(notification) {
    notification.onclick = (event) => {
      event.preventDefault();
      
      const data = event.target.data;
      if (data && data.url) {
        window.focus();
        window.location.href = data.url;
      }
      
      notification.close();
    };
  }
}

const browserNotificationService = new BrowserNotificationService();

export default browserNotificationService;
