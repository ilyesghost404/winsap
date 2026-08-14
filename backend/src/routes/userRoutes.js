const express = require("express");
const router = express.Router();
const { 
  login,
  faceLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  getLoginHistory,
  verifyEmail,
  update2FA,
  getGlobalAuditLogs,
  adminLockUser,
  adminRevokeUserSessions,
  getMe, 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  activateAccount,
  verifyActivationToken,
  resendActivationEmail,
  toggleUserStatus,
  skipFaceIdSetup,
  getMyFaceIdStatus,
  registerMyFaceId,
  verifyMyCurrentFace,
  updateMyFaceId,
  deleteMyFaceId
} = require("../controllers/userController");
const { requireAuth, authorizeRoles } = require("../middleware/authMiddleware");

// Public authentication routes
router.post("/login", login);
router.post("/face-login", faceLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/activate-account", activateAccount);
router.post("/activate-account/skip-face", skipFaceIdSetup);
router.get("/activate-account/verify", verifyActivationToken);
router.post("/verify-email", verifyEmail);

// Authenticated user profile routes
router.get("/me", requireAuth, getMe);
router.post("/change-password", requireAuth, changePassword);

// Authenticated user Face ID self-service routes
router.get("/me/face-id", requireAuth, getMyFaceIdStatus);
router.post("/me/face-id", requireAuth, registerMyFaceId);
router.post("/me/face-id/verify-current", requireAuth, verifyMyCurrentFace);
router.put("/me/face-id", requireAuth, updateMyFaceId);
router.delete("/me/face-id", requireAuth, deleteMyFaceId);

// Session management routes
router.get("/sessions", requireAuth, getActiveSessions);
router.delete("/sessions/all", requireAuth, revokeAllSessions);
router.delete("/sessions/:sessionId", requireAuth, revokeSession);

// Security settings routes
router.post("/2fa", requireAuth, update2FA);
router.get("/login-history", requireAuth, getLoginHistory);

// Admin-only user management routes
router.get("/", requireAuth, authorizeRoles("admin"), getUsers);
router.post("/", requireAuth, authorizeRoles("admin"), createUser);
router.post("/resend-activation", requireAuth, authorizeRoles("admin"), resendActivationEmail);
router.patch("/:id/status", requireAuth, authorizeRoles("admin"), toggleUserStatus);
router.put("/:id", requireAuth, authorizeRoles("admin"), updateUser);
router.delete("/:id", requireAuth, authorizeRoles("admin"), deleteUser);

// Admin security center routes
router.get("/audit-logs", requireAuth, authorizeRoles("admin"), getGlobalAuditLogs);
router.post("/:id/lock", requireAuth, authorizeRoles("admin"), adminLockUser);
router.delete("/:id/sessions", requireAuth, authorizeRoles("admin"), adminRevokeUserSessions);

module.exports = router;
