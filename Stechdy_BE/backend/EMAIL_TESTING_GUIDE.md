# 🔔 Email Reminder System - Testing Guide

## 📌 Overview

Hệ thống gửi email nhắc nhở học tập hoạt động như sau:
- ⏱️  Kiểm tra mỗi **1 phút** (chạy bởi `sessionReminderService.js`)
- 📧 Gửi email khi session bắt đầu trong vòng **14-16 phút**
- 🎯 Chỉ gửi 1 lần cho mỗi session

## 🚀 Quick Start

### 1. Kiểm tra toàn bộ hệ thống
```bash
node full-diagnostic.js
```

Script này sẽ:
- ✅ Kiểm tra email settings của user
- ✅ Tự động bật email nếu đang tắt
- ✅ Hiển thị danh sách sessions hôm nay
- ✅ Cho biết session nào sẽ nhận email

### 2. Tạo session test
```bash
node test-session.js
```

Script này tạo session bắt đầu sau **15.5 phút** (vừa đúng trong reminder window 14-16 phút)

### 3. Debug sessions hiện tại
```bash
node debug-sessions.js
```

Hiển thị:
- Tất cả sessions scheduled hôm nay
- Thời gian còn lại đến mỗi session
- Session nào trong reminder window

### 4. Kiểm tra email settings
```bash
node check-email-settings.js
```

Kiểm tra và tự động fix:
- User notification settings
- System email settings

## 📬 Email Reminder Flow

```
Session created
    ↓
Server running (npm start)
    ↓
Every 1 minute: sessionReminderService checks
    ↓
Session in 14-16 min window?
    ↓
Check email enabled?
    ↓
Send email ✉️
```

## 🐛 Troubleshooting

### ❌ Không nhận được email

**Nguyên nhân 1: Session không trong window 14-16 phút**
```bash
# Kiểm tra
node debug-sessions.js

# Tạo lại session
node test-session.js
```

**Nguyên nhân 2: Email settings bị tắt**
```bash
# Kiểm tra và auto-fix
node check-email-settings.js
```

**Nguyên nhân 3: SMTP settings sai**
- Kiểm tra file `.env`:
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password
  ```

**Nguyên nhân 4: Scheduler không chạy**
- Check server logs cho: `"Session reminder scheduler initialized"`
- Check file `src/server.js` có import `sessionReminderService`

### ❌ Email gửi nhiều lần

Hệ thống đã có logic chống duplicate:
- Lưu session đã gửi trong `reminderSent` Map
- Chỉ gửi 1 lần cho mỗi sessionId

Nếu vẫn duplicate:
1. Restart server để clear Map
2. Check database không có duplicate sessions

## 📂 Files liên quan

### Test Scripts
- `test-session.js` - Tạo session test
- `check-email-settings.js` - Kiểm tra settings
- `debug-sessions.js` - Debug sessions
- `full-diagnostic.js` - Kiểm tra toàn bộ

### Core Files
- `src/services/sessionReminderService.js` - Email reminder logic
- `src/services/emailService.js` - SMTP email sender
- `src/utils/scheduler.js` - Cron jobs cho notifications
- `src/server.js` - Khởi động schedulers

## 🔍 Monitoring

Khi server chạy, check logs cho:

```
✅ Session reminder scheduler initialized
📧 Checking for reminders every minute
```

Mỗi phút sẽ thấy:
```
Running study session reminder check...
```

Khi gửi email thành công:
```
📧 Reminder sent for session [sessionId] to [email]
```

## ⚙️ Configuration

### User Settings (Database)
```javascript
{
  notificationSettings: {
    studyReminder: true,  // ← Phải bật
    dailyEmail: true      // ← Phải bật
  }
}
```

### System Settings (Database)
```javascript
{
  notification: {
    email: true,  // ← Phải bật
    push: true,
    inApp: true
  }
}
```

## 📊 Testing Checklist

- [ ] Run `node full-diagnostic.js`
- [ ] Email settings = ✅ (auto-fixed)
- [ ] Run `node test-session.js`
- [ ] Session created trong 14-16 min window
- [ ] Run `npm start`
- [ ] See "Session reminder scheduler initialized"
- [ ] Wait for reminder time
- [ ] Check email inbox (and spam folder)
- [ ] See "Reminder sent for session..." in logs

## 🎯 Expected Timeline

```
T+0:00  → Run test-session.js
T+0:30  → Start server (npm start)
T+14:00 → Reminder window starts
T+15:30 → Email sent! 📧
T+16:00 → Reminder window ends
```

## 💡 Tips

1. **Session timing**: Tạo session bắt đầu sau 15-16 phút để test ngay
2. **Gmail users**: Cần dùng App Password, không phải mật khẩu thường
3. **Check spam**: Email có thể vào spam lần đầu
4. **Timezone**: Server dùng `Asia/Ho_Chi_Minh` timezone

## 📞 Support

Nếu vẫn gặp vấn đề:
1. Share server logs
2. Share output của `node full-diagnostic.js`
3. Check `.env` file có đúng không
4. Verify database connection
