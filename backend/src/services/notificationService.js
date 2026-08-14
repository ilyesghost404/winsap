const Notification = require('../models/Notification');
const db = require('../config/database');
const socketUtil = require('../utils/socket');

/**
 * Creates a notification for a specific user in PostgreSQL and emits it via Socket.IO
 */
async function createNotification(userId, title, message, type = 'info', referenceId = null, referenceType = null) {
  if (!userId) return null;

  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      reference_id: referenceId,
      reference_type: referenceType
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    // Emit Socket.IO real-time notification event if socket server is initialized
    try {
      const io = socketUtil.getIo();
      if (io) {
        const roomName = `user_${userId}`;
        io.to(roomName).emit('notification:new', notification);
        io.to(roomName).emit('notification:count', { unread_count: unreadCount });
      }
    } catch (socketErr) {
      console.warn("⚠️ Could not emit socket notification (socket server offline or not ready):", socketErr.message);
    }

    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error.message);
    return null;
  }
}

/**
 * Sends a notification to all active users with a specific role (e.g. manager, admin)
 */
async function notifyUsersWithRole(role, title, message, type = 'info', referenceId = null, referenceType = null) {
  try {
    const usersRes = await db.query(
      "SELECT id FROM users WHERE role = $1 AND is_active = true",
      [role]
    );

    const notifications = [];
    for (const u of usersRes.rows) {
      const notif = await createNotification(u.id, title, message, type, referenceId, referenceType);
      if (notif) notifications.push(notif);
    }
    return notifications;
  } catch (error) {
    console.error(`❌ Failed to notify users with role '${role}':`, error.message);
    return [];
  }
}

async function notifyManagers(title, message, type = 'info', referenceId = null, referenceType = null) {
  return notifyUsersWithRole('manager', title, message, type, referenceId, referenceType);
}

async function notifyAdmins(title, message, type = 'info', referenceId = null, referenceType = null) {
  return notifyUsersWithRole('admin', title, message, type, referenceId, referenceType);
}

module.exports = {
  createNotification,
  notifyUsersWithRole,
  notifyManagers,
  notifyAdmins
};
