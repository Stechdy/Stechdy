# Real-time Premium Status Update Feature

## Tổng quan
Feature này cho phép người dùng nhận được cập nhật premium status **NGAY LẬP TỨC** khi admin duyệt thanh toán, không cần phải đăng xuất và đăng nhập lại.

## Các thay đổi đã thực hiện

### Backend Changes

#### 1. `src/services/socketService.js`
- **Thêm function mới**: `sendPremiumStatusUpdate(userId, premiumData)`
  - Emit event `premium:status-updated` đến user cụ thể
  - Gửi thông tin premium status, expiry date, plan name
- **Export function mới** trong module.exports

#### 2. `src/controllers/paymentController.js`
- **Import thêm**:
  - `sendPremiumStatusUpdate` và `sendNewNotification` từ socketService
  - `Notification` model để tạo thông báo in-app
  
- **Cập nhật function `verifyPayment`**:
  - Khi admin verify payment thành công (status = 'verified'):
    1. ✅ Tạo in-app notification với type 'premium'
    2. ✅ Gửi notification qua socket (`sendNewNotification`)
    3. ✅ **Gửi premium status update qua socket** (`sendPremiumStatusUpdate`)
    4. ✅ Gửi email confirmation (giữ nguyên)

### Frontend Changes

#### 3. `src/context/SocketContext.js`
- **Thêm state**: `premiumUpdateCallback` để lưu callback function
- **Thêm socket listener**: `premium:status-updated`
  - Nhận premium data từ backend
  - Gọi registered callback (nếu có)
  - Hiển thị browser notification với requireInteraction
  - Phát notification sound
  
- **Thêm function**: `onPremiumUpdate(callback)`
  - Cho phép components đăng ký callback để handle premium updates
  - Export trong context value

#### 4. `src/hooks/usePremiumUpdates.js` ⭐ (Mới)
Custom hook xử lý premium updates:
- Đăng ký callback với socket context
- Cập nhật user data trong localStorage
- Hiển thị toast notification đẹp mắt với:
  - Gradient background (purple/blue)
  - Thông tin plan name và expiry date
  - Auto-close sau 10 giây
- **Auto reload page** sau 2 giây để refresh toàn bộ UI

#### 5. `src/components/common/PremiumUpdateHandler.js` ⭐ (Mới)
Wrapper component:
- Sử dụng `usePremiumUpdates` hook
- Bọc toàn bộ app để lắng nghe premium updates globally
- Không render gì, chỉ xử lý logic

#### 6. `src/App.js`
- Import `PremiumUpdateHandler`
- Wrap Router với `<PremiumUpdateHandler>` component
- Đặt bên trong `<SocketProvider>` để có access đến socket context

## Luồng hoạt động

### 1. User đăng ký Premium
```
User → Submit Payment → Wait for Admin Approval
          ↓
    Payment Status: pending
          ↓
    User is connected via Socket.IO
```

### 2. Admin duyệt Payment
```
Admin → Verify Payment in Admin Panel
          ↓
    paymentController.verifyPayment()
          ↓
    ✅ Update payment.status = 'verified'
    ✅ Update user.premiumStatus = 'premium'
    ✅ Calculate premiumExpiryDate
          ↓
    📢 Create in-app Notification
          ↓
    🔌 sendNewNotification(userId, notification)
    🔌 sendPremiumStatusUpdate(userId, premiumData)
```

### 3. User nhận cập nhật REAL-TIME
```
Socket Event: 'premium:status-updated'
          ↓
    SocketContext listener activated
          ↓
    Trigger premiumUpdateCallback
          ↓
    usePremiumUpdates hook:
    ✅ Update localStorage
    ✅ Show Toast Notification (Premium Activated!)
    ✅ Show Browser Notification
    ✅ Play Sound
          ↓
    Wait 2 seconds → window.location.reload()
          ↓
    🎉 User sees Premium features immediately!
```

## Features

### ✨ Real-time Updates
- Không cần refresh page
- Không cần logout/login
- Cập nhật ngay khi admin approve

### 🔔 Multiple Notifications
1. **In-app Notification** (notification bell)
2. **Socket Toast** (màn hình chính, gradient đẹp)
3. **Browser Notification** (desktop notification)
4. **Sound Alert** (notification sound)

### 🎨 Beautiful UI
- Toast với gradient purple/blue
- Hiển thị plan name và expiry date
- Auto-close sau 10 giây
- Smooth animations

### 🔄 Auto Refresh
- Reload page sau 2 giây
- Đảm bảo toàn bộ UI được cập nhật
- User thấy premium features ngay lập tức

## Testing

### Test Scenario 1: User Online
1. User đăng nhập và ở trên trang Dashboard
2. Admin duyệt payment của user
3. **Kỳ vọng**:
   - Toast notification xuất hiện ngay lập tức
   - Browser notification (nếu được phép)
   - Sound alert
   - Page reload sau 2 giây
   - Premium badge hiển thị

### Test Scenario 2: User Offline
1. User offline (đóng trình duyệt)
2. Admin duyệt payment
3. User login lại
4. **Kỳ vọng**:
   - User thấy in-app notification trong notification bell
   - Premium status đã được cập nhật

## Console Logs để Debug

### Backend
```
✅ Sent premium status update to user <userId>
📤 Emitted 'premium:status-updated' to user <userId>
```

### Frontend
```
🎉 Premium status updated: { premiumStatus, premiumExpiryDate, ... }
🎉 Premium update received in hook: { ... }
```

## Dependencies

### Backend
- `socket.io`: ^4.8.1 (đã có)
- Notification model (đã có)

### Frontend
- `socket.io-client`: ^4.8.3 (đã có)
- `react-toastify`: ^11.0.5 (đã có)

## Lưu ý

1. **Socket Connection**: User phải online và có socket connection để nhận real-time update
2. **Browser Notifications**: User phải cấp quyền "Allow notifications" 
3. **Auto Reload**: Page sẽ reload sau 2 giây để đảm bảo UI được cập nhật đầy đủ
4. **LocalStorage**: Premium status được lưu trong localStorage để persist across sessions

## Rollback (nếu cần)

Nếu cần rollback feature này:
1. Xóa `sendPremiumStatusUpdate` call trong paymentController.js
2. Xóa `PremiumUpdateHandler` khỏi App.js
3. Xóa 2 files mới: `usePremiumUpdates.js` và `PremiumUpdateHandler.js`
4. Revert changes trong SocketContext.js và socketService.js

## Author
- Implementation Date: January 16, 2026
- Feature: Real-time Premium Status Update
