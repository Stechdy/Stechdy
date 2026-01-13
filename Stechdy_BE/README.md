# Stechdy Backend API

Backend API for Stechdy application - Educational platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication:** JWT-based auth, Google OAuth integration
- **User Management:** Profile, avatars (Cloudinary), roles
- **Study Sessions:** Session tracking, reminders, scheduling
- **Real-time Notifications:** Socket.IO for live updates
- **Payment Integration:** Payment processing
- **Admin Dashboard:** Management interface

## 🛠️ Tech Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** MongoDB 7.0
- **Real-time:** Socket.IO
- **Authentication:** Passport.js, JWT
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Scheduling:** node-cron

## 📦 Quick Start

### Development

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your config
npm run dev
```

### Production with Docker

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

```bash
# Quick start
docker-compose up -d
```

## 🚢 Deployment

This project includes complete CI/CD setup for VPS deployment with:
- Docker containerization
- Nginx reverse proxy with SSL (Let's Encrypt)
- MongoDB with data persistence
- Automated GitHub Actions deployment

**Live API:** https://stechdy.ai.vn

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📚 API Documentation

Base URL: `https://stechdy.ai.vn/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile (Auth required)
- `PUT /api/users/profile` - Update profile (Auth required)
- `POST /api/upload` - Upload avatar (Auth required)

### Study Sessions
- `GET /api/study-sessions` - Get all sessions (Auth required)
- `POST /api/study-sessions` - Create session (Auth required)
- `PUT /api/study-sessions/:id` - Update session (Auth required)
- `DELETE /api/study-sessions/:id` - Delete session (Auth required)

See [backend/README.md](./backend/README.md) for more API endpoints.

## 🔧 Configuration

### Required Environment Variables

```env
# Application
PORT=3001
NODE_ENV=production
JWT_SECRET=your_jwt_secret

# Database
MONGODB_URI=mongodb://localhost:27017/Stechdy

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend
FRONTEND_URL=https://stechdy.ai.vn
```

## 🏗️ Project Structure

```
Stechdy_BE/
├── backend/
│   ├── src/
│   │   ├── config/       # Database, Passport configs
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation middleware
│   │   ├── services/     # Business logic, Socket.IO
│   │   └── utils/        # Helpers, schedulers
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
├── scripts/
│   ├── deploy.sh         # Deployment script
│   └── setup-ssl.sh      # SSL setup script
├── .github/
│   └── workflows/
│       └── deploy.yml    # CI/CD workflow
├── docker-compose.yml
└── DEPLOYMENT.md
```

## 🧪 Development

```bash
# Install dependencies
cd backend
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Seed database (if needed)
npm run seed
```

## 🐳 Docker Development

```bash
# Build image
docker build -t stechdy-backend ./backend

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 📝 License

This project is private and proprietary.

## 👥 Team

Stechdy Development Team

---

**Built with ❤️ for education**