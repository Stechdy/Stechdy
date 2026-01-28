import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import io from "socket.io-client";
import SessionExpiredModal from "../components/common/SessionExpiredModal";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [premiumUpdateCallback, setPremiumUpdateCallback] = useState(null);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // Get or create sessionId FIRST (before checking token)
    // This ensures sessionId is available even before login
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", sessionId);
      console.log("📝 Created new sessionId:", sessionId);
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, skipping socket connection");
      return;
    }

    // Skip socket connection in production if no socket server
    if (process.env.REACT_APP_ENV === 'production' && !process.env.REACT_APP_SOCKET_URL) {
      console.log("No socket server configured for production, skipping socket connection");
      return;
    }

    // Socket.IO runs on base URL, NOT /api endpoint
    const socketUrl = process.env.REACT_APP_SOCKET_URL;
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
    const serverUrl = socketUrl || apiUrl.replace(/\/api$/, ""); // Use socket URL or remove /api suffix

    console.log("🔌 Connecting to Socket.IO server...");
    console.log("🌐 Server URL:", serverUrl);
    console.log("📝 SessionID:", sessionId);
    console.log("🔑 Token:", token?.substring(0, 20) + "...");

    const newSocket = io(serverUrl, {
      auth: {
        token: token,
        sessionId: sessionId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on("connect", () => {
      console.log("✅ Socket.IO connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("connected", (data) => {
      console.log("✅ Connected to notification server:", data);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
      setIsConnected(false);

      // Check if error is due to session termination
      if (
        error.message.includes("Session terminated") ||
        error.message.includes("Logged in from another device")
      ) {
        console.log("\n========== SESSION TERMINATED ==========");
        console.log("Reason: Logged in from another device");
        console.log("Showing modal...");
        console.log("========================================\n");

        // Show modal FIRST - tokens will be cleared when user clicks button
        setShowSessionExpiredModal(true);
      }
    });

    newSocket.on("error", (error) => {
      console.error("❌ Socket.IO error:", error);
    });

    // Notification events
    newSocket.on("notification:new", (data) => {
      console.log("🔔 New notification received:", data);

      // Add notification to state
      setNotifications((prev) => [data.notification, ...prev]);

      // Update unread count
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === "granted") {
        new Notification(data.notification.title, {
          body: data.notification.message,
          icon: "/logo192.png",
          badge: "/logo192.png",
          tag: data.notification._id,
        });
      }

      // Play notification sound (optional)
      playNotificationSound();
    });

    newSocket.on("notification:unread-count", (data) => {
      console.log("📊 Unread count updated:", data.unreadCount);
      setUnreadCount(data.unreadCount);
    });

    newSocket.on("notification:read", (data) => {
      console.log("✓ Notification marked as read:", data.notificationId);

      // Update notification in state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === data.notificationId ? { ...notif, read: true } : notif,
        ),
      );
    });

    newSocket.on("notification:all-read", (data) => {
      console.log("✓ All notifications marked as read");

      // Mark all notifications as read
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );

      setUnreadCount(0);
    });

    newSocket.on("notification:deleted", (data) => {
      console.log("🗑️ Notification deleted:", data.notificationId);

      // Remove notification from state
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== data.notificationId),
      );
    });

    newSocket.on("notification:update", (data) => {
      console.log("🔄 Notifications updated:", data);
      // Trigger fetch (handled by NotificationBell)
    });

    newSocket.on("system:announcement", (data) => {
      console.log("📢 System announcement:", data);

      // Show system announcement
      if (Notification.permission === "granted") {
        new Notification("System Announcement", {
          body: data.message,
          icon: "/logo192.png",
          tag: "system-announcement",
        });
      }
    });

    // Force logout event (single-session enforcement)
    newSocket.on("auth:force-logout", (data) => {
      console.log("\n========== FORCE LOGOUT RECEIVED ==========");
      console.log("Reason:", data.reason);
      console.log("Message:", data.message);
      console.log("My SessionID:", sessionId);
      console.log("===========================================\n");

      // Show modal FIRST - tokens will be cleared when user clicks button
      setShowSessionExpiredModal(true);

      // Disconnect socket
      newSocket.disconnect();
    });

    // Premium status update
    newSocket.on("premium:status-updated", (data) => {
      console.log("🎉 Premium status updated:", data);

      // Call registered callback if exists
      if (premiumUpdateCallback) {
        premiumUpdateCallback(data);
      }

      // Show browser notification
      if (Notification.permission === "granted") {
        new Notification("🎉 Premium Activated!", {
          body: data.message,
          icon: "/logo192.png",
          tag: "premium-activated",
          requireInteraction: true,
        });
      }

      // Play notification sound
      playNotificationSound();
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting socket...");
      newSocket.disconnect();
    };
  }, []); // Only run once on mount (token from localStorage is read inside effect)

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => {
        console.log("Could not play notification sound:", err);
      });
    } catch (error) {
      console.log("Notification sound error:", error);
    }
  }, []);

  // Request notifications manually
  const requestNotifications = useCallback(() => {
    if (socket && isConnected) {
      socket.emit("request:notifications");
    }
  }, [socket, isConnected]);

  // Mark notification as read (optimistic update)
  const markNotificationAsRead = useCallback(
    (notificationId) => {
      if (socket && isConnected) {
        socket.emit("notification:mark-read", { notificationId });
      }
    },
    [socket, isConnected],
  );

  // Register callback for premium updates
  const onPremiumUpdate = useCallback((callback) => {
    setPremiumUpdateCallback(() => callback);
  }, []);

  const value = {
    socket,
    isConnected,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    requestNotifications,
    markNotificationAsRead,
    onPremiumUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      <SessionExpiredModal
        isOpen={showSessionExpiredModal}
        onClose={() => setShowSessionExpiredModal(false)}
      />
    </SocketContext.Provider>
  );
};

export default SocketContext;
