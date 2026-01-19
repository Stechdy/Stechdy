const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");

// Load env vars FIRST - includes TZ=Asia/Ho_Chi_Minh
dotenv.config();

const connectDB = require("./config/database");
const { initializeScheduler } = require("./utils/scheduler");
const { startReminderScheduler } = require("./services/sessionReminderService");
const { initializeSocket } = require("./services/socketService");

// Connect to database
connectDB();

// Initialize scheduler for notifications
try {
  initializeScheduler();
  console.log('✅ Notification scheduler initialized');
} catch (error) {
  console.error('❌ Failed to initialize notification scheduler:', error.message);
  console.error('Server will continue without scheduled notifications');
}

// Start session reminder scheduler
try {
  startReminderScheduler();
  console.log('✅ Session reminder scheduler initialized');
} catch (error) {
  console.error('❌ Failed to initialize session reminder scheduler:', error.message);
  console.error('Server will continue without session reminders');
}

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://stechdy.ai.vn',
      'https://www.stechdy.ai.vn',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/study-sessions", require("./routes/studySessionRoutes"));
app.use("/api/ai-schedule", require("./routes/aiScheduleRoutes"));
app.use("/api/moods", require("./routes/moodRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/session-reminder", require("./routes/sessionReminderRoutes"));
app.use("/api/deadlines", require("./routes/deadlineRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to S-Techdy API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Initialize Socket.IO after server starts
  initializeSocket(server);
});
