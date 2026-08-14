const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit || '50', 10);
    const notifications = await Notification.getByUserId(userId, limit);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      data: notifications,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error("GetNotifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);
    res.json({
      success: true,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error("GetUnreadCount error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await Notification.markAsRead(id, userId);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found or unauthorized" });
    }

    const unreadCount = await Notification.getUnreadCount(userId);
    res.json({
      success: true,
      data: updated,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error("MarkAsRead error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: "All notifications marked as read",
      unread_count: 0
    });
  } catch (error) {
    console.error("MarkAllAsRead error:", error);
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Notification.delete(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found or unauthorized" });
    }

    const unreadCount = await Notification.getUnreadCount(userId);
    res.json({
      success: true,
      message: "Notification deleted",
      unread_count: unreadCount
    });
  } catch (error) {
    console.error("DeleteNotification error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
