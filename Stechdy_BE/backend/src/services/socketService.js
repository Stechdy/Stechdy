const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getAllowedSocketOrigins = () => {
  const envOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(",").map((item) => item.trim()))
    .filter(Boolean);

  const defaults = [
    "https://stechdy.ai.vn",
    "https://www.stechdy.ai.vn",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  return [...new Set([...defaults, ...envOrigins])];
};

let io;
const userSockets = new Map(); // Map userId to array of {socketId, sessionId}

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 */
const initializeSocket = (server) => {
  const allowedOrigins = getAllowedSocketOrigins();

  io = socketIO(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow non-browser clients or same-origin requests without Origin header.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];
      const sessionId = socket.handshake.auth.sessionId;

      console.log(`\n🔐 Socket auth attempt - SessionID: ${sessionId}`);

      if (!token) {
        console.log(`❌ No token provided`);
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database with activeSessionId
      const user = await User.findById(decoded.id).select(
        "-password +activeSessionId",
      );

      if (!user) {
        console.log(`❌ User not found`);
        return next(new Error("Authentication error: User not found"));
      }

      console.log(`👤 User: ${user.email}`);
      console.log(`📝 Active SessionID in DB: ${user.activeSessionId}`);

      // SINGLE-SESSION ENFORCEMENT: Validate sessionId
      if (user.activeSessionId && sessionId !== user.activeSessionId) {
        console.log(
          `🚫 Socket REJECTED: Session mismatch for user ${user.email}`,
        );
        console.log(`   Expected: ${user.activeSessionId}`);
        console.log(`   Got: ${sessionId}`);
        return next(
          new Error("Session terminated: Logged in from another device"),
        );
      }

      console.log(`✅ Socket auth SUCCESS for ${user.email}\n`);

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.user = user;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    const userId = socket.userId;
    const sessionId = socket.handshake.auth.sessionId; // Get sessionId from client

    console.log(
      `✅ User connected: ${socket.user.name} (${userId}) Session: ${sessionId}`,
    );

    // Store socket connection with sessionId
    if (!userSockets.has(userId)) {
      userSockets.set(userId, []);
    }
    userSockets.get(userId).push({ socketId: socket.id, sessionId });

    console.log(
      `📊 Total sockets for user ${userId}:`,
      userSockets.get(userId).length,
    );

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Send connection success
    socket.emit("connected", {
      message: "Connected to notification server",
      userId: userId,
    });

    // Handle manual notification request
    socket.on("request:notifications", () => {
      console.log(`User ${userId} requested notifications`);
      // Trigger notification fetch (handled by frontend)
      socket.emit("notification:update", {
        type: "fetch",
        message: "Notifications updated",
      });
    });

    // Handle mark as read
    socket.on("notification:mark-read", (data) => {
      console.log(
        `User ${userId} marked notification ${data.notificationId} as read`,
      );
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.name} (${userId})`);

      // Remove this specific socket
      if (userSockets.has(userId)) {
        const sockets = userSockets
          .get(userId)
          .filter((s) => s.socketId !== socket.id);
        if (sockets.length === 0) {
          userSockets.delete(userId);
        } else {
          userSockets.set(userId, sockets);
        }
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  console.log("✅ Socket.IO initialized successfully");
  return io;
};

/**
 * Get Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

/**
 * Emit notification to specific user
 * @param {String} userId - User ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  try {
    if (!io) {
      console.warn("Socket.IO not initialized, cannot emit event");
      return false;
    }

    const userIdStr = userId.toString();
    io.to(`user:${userIdStr}`).emit(event, data);

    console.log(`📤 Emitted '${event}' to user ${userIdStr}`);
    return true;
  } catch (error) {
    console.error("Error emitting to user:", error);
    return false;
  }
};

/**
 * Emit notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToUsers = (userIds, event, data) => {
  try {
    if (!io) {
      console.warn("Socket.IO not initialized, cannot emit event");
      return false;
    }

    userIds.forEach((userId) => {
      emitToUser(userId, event, data);
    });

    return true;
  } catch (error) {
    console.error("Error emitting to users:", error);
    return false;
  }
};

/**
 * Send new notification event
 * @param {String} userId - User ID
 * @param {Object} notification - Notification object
 */
const sendNewNotification = (userId, notification) => {
  return emitToUser(userId, "notification:new", {
    notification,
    timestamp: new Date(),
  });
};

/**
 * Send notification count update
 * @param {String} userId - User ID
 * @param {Number} unreadCount - Unread count
 */
const sendUnreadCountUpdate = (userId, unreadCount) => {
  return emitToUser(userId, "notification:unread-count", {
    unreadCount,
    timestamp: new Date(),
  });
};

/**
 * Send notification marked as read event
 * @param {String} userId - User ID
 * @param {String} notificationId - Notification ID
 */
const sendNotificationRead = (userId, notificationId) => {
  return emitToUser(userId, "notification:read", {
    notificationId,
    timestamp: new Date(),
  });
};

/**
 * Send all notifications marked as read event
 * @param {String} userId - User ID
 */
const sendAllNotificationsRead = (userId) => {
  return emitToUser(userId, "notification:all-read", {
    timestamp: new Date(),
  });
};

/**
 * Send notification deleted event
 * @param {String} userId - User ID
 * @param {String} notificationId - Notification ID
 */
const sendNotificationDeleted = (userId, notificationId) => {
  return emitToUser(userId, "notification:deleted", {
    notificationId,
    timestamp: new Date(),
  });
};

/**
 * Broadcast system announcement to all connected users
 * @param {Object} announcement - Announcement data
 */
const broadcastAnnouncement = (announcement) => {
  try {
    if (!io) {
      console.warn("Socket.IO not initialized");
      return false;
    }

    io.emit("system:announcement", announcement);
    console.log("📢 Broadcasted system announcement");
    return true;
  } catch (error) {
    console.error("Error broadcasting announcement:", error);
    return false;
  }
};

/**
 * Get online users count
 */
const getOnlineUsersCount = () => {
  return userSockets.size;
};

/**
 * Check if user is online
 * @param {String} userId - User ID
 */
const isUserOnline = (userId) => {
  return userSockets.has(userId.toString());
};

/**
 * Get all online user IDs
 */
const getOnlineUserIds = () => {
  return Array.from(userSockets.keys());
};

/**
 * Send premium status update to user
 * @param {String} userId - User ID
 * @param {Object} premiumData - Premium subscription data
 */
const sendPremiumStatusUpdate = (userId, premiumData) => {
  return emitToUser(userId, "premium:status-updated", {
    premiumStatus: premiumData.premiumStatus,
    premiumExpiryDate: premiumData.premiumExpiryDate,
    planName: premiumData.planName,
    message:
      premiumData.message || "Your premium subscription has been activated!",
    timestamp: new Date(),
  });
};

/**
 * Force logout all sessions for a user except current session (single-session enforcement)
 * @param {String} userId - User ID
 * @param {String} currentSessionId - Current session ID to exclude from logout
 * @param {String} reason - Reason for force logout
 */
const forceLogoutUser = (
  userId,
  currentSessionId,
  reason = "New login from another device",
) => {
  try {
    if (!io) {
      console.warn("Socket.IO not initialized, cannot force logout");
      return false;
    }

    const userIdStr = userId.toString();

    // Get all sockets for this user
    const userSocketList = userSockets.get(userIdStr);

    console.log(`\n========== FORCE LOGOUT DEBUG ==========`);
    console.log(`User ID: ${userIdStr}`);
    console.log(`Current Session ID to EXCLUDE: ${currentSessionId}`);
    console.log(`Active sockets for this user:`, userSocketList?.length || 0);

    if (!userSocketList || userSocketList.length === 0) {
      console.log(`⚠️ No active sockets found for user ${userIdStr}`);
      console.log(`========================================\n`);
      return false;
    }

    // Log all socket sessions
    userSocketList.forEach(({ socketId, sessionId }, index) => {
      console.log(`Socket #${index + 1}: ${socketId} | Session: ${sessionId}`);
    });

    // Force logout all sessions EXCEPT the current one
    let disconnectedCount = 0;
    userSocketList.forEach(({ socketId, sessionId }) => {
      console.log(
        `\nComparing: "${sessionId}" === "${currentSessionId}" ? ${sessionId === currentSessionId}`,
      );

      if (sessionId !== currentSessionId) {
        // FIRST: Emit force-logout event to notify client (frontend will handle i18n)
        io.to(socketId).emit("auth:force-logout", {
          reason,
          timestamp: new Date(),
        });

        // THEN: Force disconnect after a short delay to ensure event is received
        setTimeout(() => {
          io.sockets.sockets.get(socketId)?.disconnect(true);
        }, 100);

        disconnectedCount++;
        console.log(
          `🔌 Sent force-logout + scheduling disconnect for socket ${socketId} (session: ${sessionId})`,
        );
      } else {
        console.log(`✓ Keeping current session ${sessionId} active`);
      }
    });

    console.log(
      `🔐 Force disconnect completed: ${disconnectedCount} old sockets disconnected`,
    );
    console.log(`ℹ️  Old sockets will be rejected when they try to reconnect`);
    console.log(`========================================\n`);
    return true;
  } catch (error) {
    console.error("Error forcing logout:", error);
    return false;
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToUsers,
  sendNewNotification,
  sendUnreadCountUpdate,
  sendNotificationRead,
  sendAllNotificationsRead,
  sendNotificationDeleted,
  broadcastAnnouncement,
  getOnlineUsersCount,
  isUserOnline,
  getOnlineUserIds,
  sendPremiumStatusUpdate,
  forceLogoutUser,
};
