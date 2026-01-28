/**
 * Active Sessions Management Endpoints
 *
 * Optional feature: Allows users to view and manage their active login sessions
 *
 * To enable this feature:
 * 1. Add these routes to your authRoutes.js:
 *    router.get('/sessions', auth, authController.getActiveSessions);
 *    router.delete('/sessions/:sessionIndex', auth, authController.revokeSession);
 *    router.delete('/sessions', auth, authController.revokeAllSessions);
 *
 * 2. Add these functions to your authController.js
 */

const User = require("../models/User");

/**
 * @desc    Get all active sessions for current user
 * @route   GET /api/auth/sessions
 * @access  Private
 */
exports.getActiveSessions = async (req, res) => {
  try {
    // Get user with refreshTokens
    const user = await User.findById(req.user.id).select("+refreshTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Clean up expired tokens first
    if (user.refreshTokens) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => new Date(rt.createdAt).getTime() > thirtyDaysAgo,
      );
      await user.save();
    }

    // Format sessions for response (hide actual tokens for security)
    const sessions =
      user.refreshTokens?.map((rt, index) => ({
        index,
        deviceInfo: rt.deviceInfo,
        createdAt: rt.createdAt,
        lastUsed: rt.lastUsed,
        isCurrentSession: rt.token === req.body.refreshToken, // Mark current session
      })) || [];

    res.json({
      success: true,
      message: "Lấy danh sách phiên đăng nhập thành công",
      data: {
        totalSessions: sessions.length,
        sessions: sessions.sort(
          (a, b) =>
            new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
        ),
      },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách phiên đăng nhập",
    });
  }
};

/**
 * @desc    Revoke a specific session by index
 * @route   DELETE /api/auth/sessions/:sessionIndex
 * @access  Private
 */
exports.revokeSession = async (req, res) => {
  try {
    const { sessionIndex } = req.params;
    const index = parseInt(sessionIndex);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: "Chỉ số phiên không hợp lệ",
      });
    }

    // Get user with refreshTokens
    const user = await User.findById(req.user.id).select("+refreshTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (!user.refreshTokens || index >= user.refreshTokens.length) {
      return res.status(404).json({
        success: false,
        message: "Phiên đăng nhập không tồn tại",
      });
    }

    // Remove the session at specified index
    const removedSession = user.refreshTokens[index];
    user.refreshTokens.splice(index, 1);
    await user.save();

    console.log(
      `🔐 User ${user.email} revoked session: ${removedSession.deviceInfo}`,
    );

    res.json({
      success: true,
      message: "Đã thu hồi phiên đăng nhập",
      data: {
        revokedDevice: removedSession.deviceInfo,
        remainingSessions: user.refreshTokens.length,
      },
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi thu hồi phiên đăng nhập",
    });
  }
};

/**
 * @desc    Revoke all sessions except current one
 * @route   DELETE /api/auth/sessions
 * @access  Private
 */
exports.revokeAllOtherSessions = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token không được cung cấp",
      });
    }

    // Get user with refreshTokens
    const user = await User.findById(req.user.id).select("+refreshTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    const totalBefore = user.refreshTokens?.length || 0;

    // Keep only the current session
    user.refreshTokens =
      user.refreshTokens?.filter((rt) => rt.token === refreshToken) || [];

    await user.save();

    const revokedCount = totalBefore - user.refreshTokens.length;

    console.log(`🔐 User ${user.email} revoked ${revokedCount} other sessions`);

    res.json({
      success: true,
      message: `Đã thu hồi ${revokedCount} phiên đăng nhập khác`,
      data: {
        revokedSessions: revokedCount,
        remainingSessions: user.refreshTokens.length,
      },
    });
  } catch (error) {
    console.error("Revoke all other sessions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi thu hồi các phiên đăng nhập",
    });
  }
};

// Export for use in authController.js
module.exports = {
  getActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
};
