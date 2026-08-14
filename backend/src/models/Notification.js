const db = require('../config/database');

class Notification {
  static async create({ user_id, title, message, type = 'info', reference_id = null, reference_type = null }) {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, title, message, type, reference_id, reference_type, is_read, created_at, read_at;
    `;
    const values = [user_id, title, message, type, reference_id, reference_type];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  static async getByUserId(userId, limit = 50) {
    const query = `
      SELECT id, user_id, title, message, type, reference_id, reference_type, is_read, created_at, read_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    const res = await db.query(query, [userId, limit]);
    return res.rows;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*)::int AS unread_count
      FROM notifications
      WHERE user_id = $1 AND is_read = false;
    `;
    const res = await db.query(query, [userId]);
    return res.rows[0]?.unread_count || 0;
  }

  static async markAsRead(id, userId) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, title, message, type, reference_id, reference_type, is_read, created_at, read_at;
    `;
    const res = await db.query(query, [id, userId]);
    return res.rows[0] || null;
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false;
    `;
    await db.query(query, [userId]);
    return true;
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;
    const res = await db.query(query, [id, userId]);
    return res.rows.length > 0;
  }
}

module.exports = Notification;
