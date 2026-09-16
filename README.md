# 🎓 S-Techdy — AI-Powered Smart Educational & Study Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web%20Application-blue.svg?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Google%20Gemini-Generative%20AI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="CI/CD" />
</p>

<p align="center">
  <strong>Một nền tảng quản lý học tập thông minh toàn diện (All-in-One EdTech Ecosystem) tích hợp Trợ lý Trí tuệ Nhân tạo (Google Gemini AI), giao tiếp thời gian thực hai chiều (Socket.IO), theo dõi sức khỏe tinh thần (Mood Tracking), cơ chế động lực hóa (Gamification/Streak) và thanh toán tự động VietQR.</strong>
</p>

<p align="center">
  🌐 <strong>Production Live URL:</strong> <a href="https://stechdy.ai.vn">https://stechdy.ai.vn</a> • 
  📡 <strong>API Endpoint:</strong> <a href="https://stechdy.ai.vn/api">https://stechdy.ai.vn/api</a>
</p>

---

## 📑 Project Documentation & Deliverables

> 💡 **Tài liệu dự án (Docs & Resources):** Các liên kết tài liệu thiết kế, tài liệu kỹ thuật, demo và tài nguyên được tổng hợp tại đây để tiện tra cứu và đánh giá:

| 📄 Tài liệu | 🔗 Liên kết (Link) | 📝 Mô tả nội dung |
| :--- | :--- | :--- |
| **Figma UI/UX Prototype & Design System** | https://www.figma.com/design/uZTWUuiZXfmAyiobl5Hccy/S-Techdy?node-id=518-91&t=9G6KMutzi7ifIwGA-1 | Wireframe, High-fidelity UI, Bộ màu Dark/Light, Typography & Components |
| **Video Demo & Project Presentation** | https://drive.google.com/file/d/1KNihikF6jMQrPT-a1_P3az_-IOih9xKE/view?usp=drive_link | Video walkthrough toàn bộ tính năng và Slide thuyết trình báo cáo |
|**Tài liệu SRS**| https://drive.google.com/file/d/1WJZl6gFb5DF9T3D2AZglvzE49_dYeSyc/view?usp=drive_link | Các thông tin chuyên ngành về hệ thống Stechdy |

---

<img width="605" height="338" alt="image" src="https://github.com/user-attachments/assets/bda6068f-e8a9-4906-9ed1-d4f2bd6f8ff0" />


## 💡 Giới Thiệu Dự Án (Project Overview)

Trong kỷ nguyên số, sinh viên và người học thường xuyên đối mặt với các vấn đề:
1. **Quá tải thông tin và deadline**: Lịch học và bài tập rải rác trên nhiều nền tảng, dễ dẫn đến trễ hạn.
2. **Thiếu tập trung và kiên trì**: Học tập thiếu động lực, thiếu cơ chế nhắc nhở và dễ bỏ dở giữa chừng.
3. **Căng thẳng tâm lý học đường (Burnout)**: Thiếu sự quan tâm đến trạng thái sức khỏe tinh thần và cảm xúc trong quá trình học.

**S-Techdy** được xây dựng như một **trợ lý học tập cá nhân hóa 24/7**, giải quyết triệt để các vấn đề trên bằng cách kết hợp:
- **Trí tuệ nhân tạo (Google Gemini)** đồng hành giải đáp thắc mắc và tự động xây dựng lộ trình học tập tối ưu.
- **Thời gian biểu thông minh & Pomodoro Tracker** tích hợp công nghệ đồng bộ thời gian thực.
- **Theo dõi cảm xúc (Mental Wellness & Mood Analytics)** giúp phát hiện sớm nguy cơ kiệt sức và stress.
- **Cơ chế Game hóa (Daily Streak & Gamification)** tạo thói quen học tập bền bỉ mỗi ngày.
- **Luồng thanh toán VietQR thông minh** kích hoạt tài khoản Premium ngay lập tức bằng WebSocket.

---

## 💎 Điểm Nhấn Kỹ Thuật Nổi Bật (Key Technical Highlights)

- **Frontend thế hệ mới với React 19**: Tận dụng tối đa hiệu năng render vượt trội của React 19, kết hợp hệ thống CSS Glassmorphism tùy biến mượt mà, hỗ trợ **Dark / Light Theme** và đa ngôn ngữ (**i18n** Tiếng Việt / Tiếng Anh).
- **Google Gemini Generative AI**: Tích hợp trực tiếp trợ lý học tập AI (`@google/generative-ai`), hỗ trợ hỏi đáp kiến thức, tóm tắt bài giảng, phân tích tâm lý người học và tự động tạo đề cương ôn tập.
- **Kiến trúc Real-time Event-driven (Socket.IO)**:
  - Thông báo tức thì không có độ trễ khi có lịch học hoặc deadline sắp đến.
  - **Instant Premium Sync**: Khi Admin phê duyệt thanh toán, tài khoản người dùng được tự động kích hoạt quyền Premium ngay lập tức qua WebSocket mà **không cần đăng xuất hay tải lại trang thủ công**.
- **Cổng thanh toán VietQR Banking tự động**: Sinh mã QR chuẩn ngân hàng Việt Nam tự động với mã giao dịch duy nhất cho từng đơn hàng, đối soát và kích hoạt dịch vụ tự động.
- **Động cơ thông báo đa kênh tự động (Multi-channel Engine)**: Kết hợp In-app Toast, Browser WebPush Notification, và Email giao dịch (HTML Responsive Email qua Nodemailer) được điều phối bởi lịch trình `node-cron`.
- **Hạ tầng DevOps & CI/CD chuẩn Production**: Container hóa toàn diện với **Docker & Docker Compose**, tự động build và deploy lên máy chủ VPS qua **GitHub Actions**, vận hành qua Reverse Proxy **Nginx** với chứng chỉ bảo mật **SSL Let's Encrypt** tự động gia hạn.

---

## 🏛️ Kiến Trúc Hệ Thống (System Architecture)

```
                                  ┌───────────────────────────────────┐
                                  │           Client Device           │
                                  │   (React 19 SPA + Socket Client)  │
                                  └─────────────────┬─────────────────┘
                                                    │ HTTPS (443) / WSS
                                                    ▼
                                  ┌───────────────────────────────────┐
                                  │        Nginx Reverse Proxy        │
                                  │   (SSL Let's Encrypt / Gzip / LB) │
                                  └────────┬───────────────────┬──────┘
                                           │                   │
                        /api, /socket.io   │                   │ /* (Static Web Files)
                                           ▼                   ▼
                     ┌─────────────────────────────┐   ┌───────────────────────────┐
                     │     Stechdy Backend API     │   │      Stechdy Frontend     │
                     │    (Node.js + Express.js)   │   │       (React 19 Nginx)    │
                     └──────────────┬──────────────┘   └───────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┬──────────────────────────┐
         ▼                          ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   MongoDB 7.0    │       │  Google Gemini   │       │  Cloudinary CDN  │       │   SMTP Gateway   │
│ 29 Data Models   │       │  Generative AI   │       │  Avatars & Media │       │   Email Alerts   │
└──────────────────┘       └──────────────────┘       └──────────────────┘       └──────────────────┘
```

---

## 🚀 Các Phân Hệ & Tính Năng Chi Tiết (Core Features)

### 1. 🤖 Trợ Lý Học Tập Thông Minh (AI Study Buddy & Generator)
- **AI Chat Companion**: Trò chuyện học tập 24/7 với Google Gemini, giải thích bài tập, tóm lược kiến thức khó, tạo dàn ý tiểu luận.
- **AI Schedule Generator**: Tự động phân tích các mốc thi cử và đề xuất phân bổ thời gian biểu ôn thi tối ưu cho từng môn học.

### 2. 📅 Lịch Biểu & Theo Dõi Deadline (Smart Timetable & Deadlines)
- **Interactive Calendar & Schedule Editor**: Quản lý lịch học, ca học, giảng viên, phòng học bằng giao diện màu sắc trực quan.
- **Deadline Countdown**: Đếm ngược thời gian nộp bài, phân loại ưu tiên (Cao / Trung bình / Thấp) và nhắc nhở trước hạn.
- **Focus Pomodoro Timer**: Đồng hồ đếm ngược phiên tập trung, tích hợp âm thanh thông báo và lưu lại tổng số giờ học thực tế.

### 3. 🧠 Quản Lý Sức Khỏe Tinh Thần (Mental Wellness & Mood Tracker)
- **Daily Mood Logging**: Ghi nhận cảm xúc hàng ngày (Hào hứng, Vui vẻ, Bình thường, Căng thẳng, Kiệt sức).
- **AI Mood Insights**: Phân tích biểu đồ biến thiên tâm trạng, đưa ra lời khuyên khoa học để giảm tải áp lực thi cử và tránh burnout.

### 4. 🏆 Cơ Chế Động Lực Học Tập (Gamification & Daily Streaks)
- **Daily Streak Counter**: Theo dõi chuỗi ngày vào học liên tục, tự động cộng dồn streak khi hoàn thành nhiệm vụ trong ngày.
- **XP & Achievement Badges**: Hệ thống điểm kinh nghiệm và huy hiệu khuyến khích sinh viên duy trì kỷ luật học tập.

### 5. 💳 Thanh Toán & Nâng Cấp Gói VIP (VietQR Subscriptions)
- **Gói cước linh hoạt**: Cung cấp các gói học tập mở rộng tính năng AI nâng cao và không giới hạn lịch học.
- **VietQR Checkout**: Sinh mã QR động chuẩn ngân hàng Việt Nam, người dùng chỉ cần quét mã bằng app Mobile Banking.
- **Real-time Activation**: Kích hoạt trạng thái VIP ngay khi admin duyệt mà không phải đăng nhập lại.

### 6. 🛡️ Cổng Quản Trị Hệ Thống (Admin Operations Portal)
- **Bảng điều khiển trực quan**: Thống kê số lượng học viên, tỉ lệ chuyên cần, trạng thái hoạt động và doanh thu gói VIP.
- **Quản trị người dùng & giao dịch**: Phê duyệt thanh toán 1 chạm, phân quyền tài khoản (Student / Admin).

---

## 🛠️ Công Nghệ Sử Dụng (Technology Stack)

| Lĩnh Vực | Danh Sách Công Nghệ |
| :--- | :--- |
| **Frontend Framework** | React 19 (`^19.2.0`), React Router DOM v7 (`^7.10.1`), CRACO, React App Rewired |
| **AI Integration** | Google Generative AI (`@google/generative-ai` - Gemini Models) |
| **Realtime Gateway** | Socket.IO Client (`^4.8.3`), Browser WebPush Notification API |
| **State & Styling** | React Context API, Custom Hooks, Modern CSS Glassmorphism, Dark/Light Theme |
| **UI Utilities** | Canvas Confetti, React Toastify, QRCode Generator (VietQR), i18next (EN/VI) |
| **Backend Runtime** | Node.js 18 LTS, Express.js 4.18 |
| **Database & ODM** | MongoDB 7.0, Mongoose ODM 8.0 (29 Data Models) |
| **Authentication** | JSON Web Tokens (JWT), Passport.js, Google OAuth 2.0 (`passport-google-oauth20`), Bcryptjs |
| **File & Media Storage** | Cloudinary SDK, Multer, Multer Storage Cloudinary |
| **Scheduled Tasks** | Node-cron (Tác vụ nền quét lịch học, tính streak hàng ngày, gửi email) |
| **Mailing Service** | Nodemailer (Gửi email xác thực, thông báo lịch học bằng HTML template) |
| **DevOps & Infrastructure** | Docker, Docker Compose, Nginx, Let's Encrypt Certbot, Linux Ubuntu VPS |
| **CI / CD Pipeline** | GitHub Actions Workflow (Tự động build, kiểm tra, push Docker Hub và deploy SSH) |

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu (Mongoose Models Overview)

Hệ thống được thiết kế với **29 Collections** chặt chẽ, tối ưu truy vấn:

| Nhóm Nghiệp Vụ | Mongoose Models Chính | Mục Đích Lưu Trữ |
| :--- | :--- | :--- |
| **Người dùng & Xác thực** | `User`, `Settings`, `SystemConfig` | Hồ sơ cá nhân, hashed password, quyền hạn (Role), cài đặt thông báo |
| **Lịch trình & Buổi học** | `StudySessionSchedule`, `StudyTimetable`, `Subject`, `Semester`, `BusySchedule` | Lịch biểu chi tiết, môn học, học kỳ, khung giờ bận và ca học |
| **Nhiệm vụ & Deadline** | `Deadline`, `Task`, `SmartNote` | Bài tập về nhà, thời hạn nộp, ghi chú thông minh cá nhân |
| **Trí tuệ nhân tạo (AI)** | `AIGenerationResult`, `AIInput`, `AIStudyBuddy`, `AIMoodInsight` | Lịch sử đoạn chat với AI, đề cương AI sinh ra, phân tích tâm lý |
| **Động lực & Game hóa** | `Streak`, `Gamification`, `ActivityLog`, `Analytics` | Chuỗi ngày học liên tục, điểm kinh nghiệm, lịch sử hoạt động |
| **Cảm xúc & Tinh thần** | `MoodTracking` | Điểm cảm xúc hàng ngày, nhật ký tâm trạng |
| **Giao dịch & Thanh toán**| `Payment`, `PremiumSubscription`, `Product`, `Discount` | Lịch sử giao dịch VietQR, gói VIP, mã giảm giá |
| **Thông báo & Nhắc việc** | `Notification`, `NotificationLog`, `Reminder` | Danh sách thông báo in-app, nhật ký gửi mail & WebPush |

---

## 📡 Danh Mục API Endpoints Chính (RESTful API)

Base URL: `https://stechdy.ai.vn/api` (Production) hoặc `http://localhost:3001/api` (Development)

```
Authentication & Users:
├── POST   /api/auth/register            # Đăng ký tài khoản người dùng mới
├── POST   /api/auth/login               # Đăng nhập hệ thống, cấp mã JWT Token
├── POST   /api/auth/google              # Đăng nhập bằng tài khoản Google (OAuth 2.0)
├── POST   /api/auth/forgot-password     # Yêu cầu link đặt lại mật khẩu qua email
├── GET    /api/users/profile            # Lấy thông tin cá nhân của người dùng hiện tại
└── POST   /api/upload                   # Upload ảnh đại diện lên CDN Cloudinary

Lịch học & Deadline:
├── GET    /api/study-sessions           # Lấy danh sách lịch học theo tuần/tháng
├── POST   /api/study-sessions           # Tạo buổi học mới vào thời gian biểu
├── GET    /api/deadlines                # Danh sách hạn nộp bài tập sắp đến
└── POST   /api/deadlines                # Thêm deadline mới kèm mức độ ưu tiên

Cảm xúc & Trợ lý AI:
├── POST   /api/mood                     # Lưu lại nhật ký cảm xúc trong ngày
├── GET    /api/mood/history             # Biểu đồ diễn biến tâm trạng
├── POST   /api/ai-chat/message          # Gửi tin nhắn và nhận phản hồi từ Gemini AI
└── POST   /api/ai-schedule/generate     # Tự động lập lịch học thông minh bằng AI

Thanh toán & Quản trị:
├── POST   /api/payments/create          # Tạo giao dịch nâng cấp VIP kèm mã VietQR
├── POST   /api/payments/verify/:id      # Admin duyệt thanh toán & bắn Socket kích hoạt
├── GET    /api/admin/dashboard          # Bảng thống kê toàn diện cho Admin
└── GET    /api/admin/users              # Quản lý danh sách người dùng
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Monorepo Layout)

```
Stechdy/
├── Stechdy_BE/                  # 🛡️ BACKEND SERVICE
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/          # Cấu hình Database, Cloudinary, Passport OAuth
│   │   │   ├── controllers/     # Request handlers & controllers nghiệp vụ
│   │   │   ├── middleware/      # JWT Auth guard, Role check, Data sanitizers
│   │   │   ├── models/          # 29 Mongoose schemas & data modeling
│   │   │   ├── routes/          # RESTful API route definitions
│   │   │   ├── services/        # Socket.IO, Nodemailer, Mood Analysis logic
│   │   │   ├── utils/           # Cron schedulers & system helpers
│   │   │   ├── seed.js          # Khởi tạo dữ liệu mẫu hệ thống
│   │   │   └── server.js        # Entrypoint Express server & Socket gateway
│   │   ├── Dockerfile           # Docker multi-stage build cho Backend
│   │   └── package.json
│   └── README.md
│
├── Stechdy_FE/                  # 🎨 FRONTEND SERVICE
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── assets/          # Hình ảnh, âm thanh thông báo, icons
│   │   │   ├── components/      # Reusable UI components & modals
│   │   │   ├── context/         # SocketContext, ThemeContext, AppContext
│   │   │   ├── hooks/           # Custom React hooks (usePremiumUpdates...)
│   │   │   ├── i18n/            # Đa ngôn ngữ Tiếng Việt / Tiếng Anh
│   │   │   ├── pages/           # 24 trang màn hình chức năng
│   │   │   ├── services/        # Axios API clients & WebSocket managers
│   │   │   ├── styles/          # Hệ thống CSS Glassmorphism & Themes
│   │   │   ├── App.js           # Route config & Provider wraps
│   │   │   └── index.js         # React 19 Root mount
│   │   ├── Dockerfile           # Docker build cho Frontend
│   │   └── package.json
│   └── README.md
│
├── nginx/                       # 🌐 NGINX REVERSE PROXY
│   ├── nginx.conf               # Cấu hình tối ưu SSL, Cache, Gzip, WebSockets
│   └── conf.d/default.conf      # Routing /api, /socket.io và static frontend
├── scripts/                     # ⚙️ DEPLOYMENT AUTOMATION
│   ├── deploy.sh                # Script triển khai tự động trên VPS
│   └── setup-ssl.sh             # Script cài đặt SSL Let's Encrypt tự động
├── .github/workflows/           # 🔄 CI/CD AUTOMATION
│   └── deploy.yml               # GitHub Actions pipeline
├── docker-compose.yml           # 🐳 Docker Multi-Container Orchestration
└── DEPLOYMENT.md                # 📖 Hướng dẫn chi tiết vận hành VPS & SSL
```

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ (Quick Start)

### 1. Yêu cầu tiên quyết
- **Node.js**: Phiên bản 18 LTS trở lên
- **MongoDB**: Bản cài đặt local hoặc MongoDB Atlas URI
- **Docker & Docker Compose** (nếu muốn chạy qua container)

### 2. Tải mã nguồn
```bash
git clone https://github.com/<your-username>/Stechdy.git
cd Stechdy
```

### 3. Chạy từng dịch vụ độc lập (Manual Setup)

#### Khởi động Backend:
```bash
cd Stechdy_BE/backend
npm install
cp .env.example .env     # Cấu hình MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID...
npm run seed             # (Tùy chọn) Nạp dữ liệu mẫu
npm run dev              # Server lắng nghe tại http://localhost:3001
```

#### Khởi động Frontend:
```bash
cd Stechdy_FE/frontend
npm install
cp .env.example .env     # Cấu hình REACT_APP_API_URL=http://localhost:3001/api
npm start                # Giao diện khởi chạy tại http://localhost:3000
```

### 4. Chạy toàn bộ hệ thống bằng Docker Compose (Khuyên Dùng)

```bash
# Khởi chạy đồng thời: Backend + Frontend + MongoDB + Nginx Reverse Proxy
docker-compose up -d

# Xem log hoạt động theo thời gian thực
docker-compose logs -f

# Kiểm tra trạng thái sức khỏe các container
docker-compose ps

# Dừng toàn bộ hệ thống
docker-compose down
```

---

## 🚢 Quy Trình CI/CD & Triển Khai Production (DevOps Flow)

```
 [Lập trình viên]
        │
        │ git push origin main
        ▼
 ┌──────────────────────────────────────────────┐
 │          GitHub Actions Pipeline             │
 │  1. Checkout code & Syntax check             │
 │  2. Build Docker images (BE & FE)            │
 │  3. Tag version & Push lên Docker Hub        │
 └──────────────────────┬───────────────────────┘
                        │
                        │ SSH Trigger tới VPS
                        ▼
 ┌──────────────────────────────────────────────┐
 │              Ubuntu Linux VPS                │
 │  1. Pull docker images mới nhất              │
 │  2. Zero-downtime container rolling restart  │
 │  3. Healthcheck xác nhận trạng thái 200 OK   │
 │  4. Nginx Reverse Proxy & SSL Auto Renewal   │
 └──────────────────────────────────────────────┘
```

Hệ thống được cấu hình tự động triển khai hoàn toàn mỗi khi có commit mới vào nhánh `main`. Chi tiết cấu hình VPS, biến môi trường secrets và khôi phục sự cố được trình bày đầy đủ tại: **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 👨‍💻 Tác Giả & Thông Tin Liên Hệ (Author Profile)

- **Họ và tên:** **Trần Vũ Kiên** (Lead Full-Stack Developer)
- **GitHub:** [@tranvukien125](https://github.com/tranvukien125)
- **Email:** [Add your email here]
- **LinkedIn:** [Add your LinkedIn profile link here]
- **Dự án Live Demo:** [https://stechdy.ai.vn](https://stechdy.ai.vn)

---

<p align="center">
  ⭐ <strong>Cảm ơn bạn đã ghé thăm dự án! Nếu bạn thấy dự án này thú vị, hãy tặng cho repo một Star nhé!</strong> ⭐
</p>
