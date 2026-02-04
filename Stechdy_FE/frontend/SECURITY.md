# Security Guidelines / Hướng Dẫn Bảo Mật

## Ngôn ngữ / Language
- [Tiếng Việt](#tiếng-việt)
- [English](#english)

---

## Tiếng Việt

### 1. Biến Môi Trường (Environment Variables)

#### ⚠️ QUAN TRỌNG
- **KHÔNG BAO GIỜ** commit file `.env` vào Git
- File `.env` đã được thêm vào `.gitignore`
- Sử dụng file `.env.example` làm template

#### Cách thiết lập:
```bash
# 1. Copy file example
cp .env.example .env

# 2. Chỉnh sửa file .env với thông tin thực của bạn
# Thay thế các giá trị placeholder bằng API keys thật
```

#### Các biến quan trọng:
- `REACT_APP_GEMINI_API_KEY`: API key cho Google Gemini AI
- `REACT_APP_GOOGLE_CLIENT_ID`: Client ID cho Google OAuth
- `REACT_APP_API_URL`: URL của backend API
- `REACT_APP_N8N_WEBHOOK_URL`: URL webhook n8n

### 2. API Keys

#### Lấy API Keys:
- **Google Gemini AI**: https://makersuite.google.com/app/apikey
- **Google OAuth**: https://console.cloud.google.com/apis/credentials

#### Bảo vệ API Keys:
- ✅ Lưu trong file `.env` (đã được gitignore)
- ✅ Sử dụng `process.env.REACT_APP_*` để truy cập
- ❌ KHÔNG hard-code trực tiếp trong code
- ❌ KHÔNG commit vào Git
- ❌ KHÔNG chia sẻ công khai

### 3. Dữ Liệu Nhạy Cảm

#### Không được log:
- ❌ Passwords
- ❌ Tokens (JWT, OAuth)
- ❌ Email/Phone đầy đủ
- ❌ API Keys
- ❌ Session IDs

#### Chỉ log:
- ✅ Error messages (không chứa thông tin nhạy cảm)
- ✅ Error types và codes
- ✅ Request status codes
- ✅ Partial identifiers (ví dụ: `user_***123`)

### 4. localStorage và sessionStorage

#### Dữ liệu được lưu:
- Token (JWT)
- User basic info (name, email)
- Theme preferences
- Language settings

#### Lưu ý:
- Dữ liệu trong localStorage có thể bị đọc bởi JavaScript
- KHÔNG lưu password hoặc dữ liệu cực kỳ nhạy cảm
- Token sẽ expire và cần refresh

### 5. Console Logs

#### Production:
```javascript
// ❌ KHÔNG làm thế này
console.log('User token:', token);
console.log('Password:', password);

// ✅ Làm thế này
console.error('Authentication failed:', error.message);
```

#### Các file đã được làm sạch:
- ✅ Đã xóa tất cả debug `console.log`
- ✅ Giữ lại `console.error` cho error tracking
- ✅ Không log thông tin nhạy cảm

### 6. Network Requests

#### Headers:
```javascript
// ✅ Đúng cách
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

#### Error Handling:
```javascript
// ✅ Không expose error details cho user
catch (error) {
  console.error('Request failed:', error.message); // For debugging
  toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.'); // Generic message for user
}
```

### 7. HTTPS & SSL

#### Production:
- ✅ Luôn sử dụng HTTPS
- ✅ SSL certificate hợp lệ
- ✅ Redirect HTTP → HTTPS

### 8. Dependencies

#### Cập nhật thường xuyên:
```bash
# Kiểm tra vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update packages
npm update
```

### 9. Best Practices

#### Code:
- ✅ Validate input từ user
- ✅ Sanitize data trước khi hiển thị
- ✅ Sử dụng HTTPS cho tất cả API calls
- ✅ Implement rate limiting
- ✅ Use CSP (Content Security Policy)

#### Deployment:
- ✅ Tách môi trường dev/staging/production
- ✅ Sử dụng environment-specific configs
- ✅ Enable CORS properly
- ✅ Regular security audits

---

## English

### 1. Environment Variables

#### ⚠️ IMPORTANT
- **NEVER** commit `.env` file to Git
- `.env` is already added to `.gitignore`
- Use `.env.example` as template

#### Setup:
```bash
# 1. Copy example file
cp .env.example .env

# 2. Edit .env with your actual credentials
# Replace placeholder values with real API keys
```

#### Important variables:
- `REACT_APP_GEMINI_API_KEY`: API key for Google Gemini AI
- `REACT_APP_GOOGLE_CLIENT_ID`: Client ID for Google OAuth
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_N8N_WEBHOOK_URL`: n8n webhook URL

### 2. API Keys

#### Get API Keys:
- **Google Gemini AI**: https://makersuite.google.com/app/apikey
- **Google OAuth**: https://console.cloud.google.com/apis/credentials

#### Protect API Keys:
- ✅ Store in `.env` file (gitignored)
- ✅ Access via `process.env.REACT_APP_*`
- ❌ DO NOT hard-code in source
- ❌ DO NOT commit to Git
- ❌ DO NOT share publicly

### 3. Sensitive Data

#### Never log:
- ❌ Passwords
- ❌ Tokens (JWT, OAuth)
- ❌ Full Email/Phone
- ❌ API Keys
- ❌ Session IDs

#### Only log:
- ✅ Error messages (without sensitive data)
- ✅ Error types and codes
- ✅ Request status codes
- ✅ Partial identifiers (e.g., `user_***123`)

### 4. localStorage & sessionStorage

#### Data stored:
- Token (JWT)
- User basic info (name, email)
- Theme preferences
- Language settings

#### Notes:
- localStorage data can be read by JavaScript
- DO NOT store passwords or extremely sensitive data
- Tokens will expire and need refresh

### 5. Console Logs

#### Production:
```javascript
// ❌ DON'T do this
console.log('User token:', token);
console.log('Password:', password);

// ✅ Do this instead
console.error('Authentication failed:', error.message);
```

#### Cleaned files:
- ✅ Removed all debug `console.log`
- ✅ Kept `console.error` for error tracking
- ✅ No sensitive information logged

### 6. Network Requests

#### Headers:
```javascript
// ✅ Correct way
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

#### Error Handling:
```javascript
// ✅ Don't expose error details to user
catch (error) {
  console.error('Request failed:', error.message); // For debugging
  toast.error('An error occurred. Please try again.'); // Generic message for user
}
```

### 7. HTTPS & SSL

#### Production:
- ✅ Always use HTTPS
- ✅ Valid SSL certificate
- ✅ Redirect HTTP → HTTPS

### 8. Dependencies

#### Regular updates:
```bash
# Check vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update packages
npm update
```

### 9. Best Practices

#### Code:
- ✅ Validate user input
- ✅ Sanitize data before display
- ✅ Use HTTPS for all API calls
- ✅ Implement rate limiting
- ✅ Use CSP (Content Security Policy)

#### Deployment:
- ✅ Separate dev/staging/production environments
- ✅ Use environment-specific configs
- ✅ Enable CORS properly
- ✅ Regular security audits

---

## Báo Cáo Lỗ Hổng Bảo Mật / Security Vulnerability Reporting

Nếu bạn phát hiện lỗ hổng bảo mật, vui lòng KHÔNG tạo public issue. Thay vào đó, liên hệ trực tiếp qua email.

If you discover a security vulnerability, please DO NOT create a public issue. Instead, contact us directly via email.

**Email**: security@stechdy.ai.vn

---

## Changelog

- **2024-02-04**: Initial security documentation
- **2024-02-04**: Removed all debug console.log statements
- **2024-02-04**: Added GEMINI_API_KEY to environment variables
