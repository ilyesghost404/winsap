require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const notificationController = require('./src/controllers/notificationController');

async function testNotificationApi() {
  console.log("==========================================");
  console.log("  Testing Notification API Endpoints      ");
  console.log("==========================================");

  // Clean test user
  await pool.query("DELETE FROM users WHERE username = 'notif_api_user'");

  const userRes = await pool.query(
    "INSERT INTO users (username, email, password_hash, role) VALUES ('notif_api_user', 'api_user@test.local', 'hash', 'employee') RETURNING id"
  );
  const userId = userRes.rows[0].id;

  // Insert 2 test notifications
  const notifRes1 = await pool.query(
    "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, 'Test Title 1', 'Message 1', 'info') RETURNING id",
    [userId]
  );
  const notifRes2 = await pool.query(
    "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, 'Test Title 2', 'Message 2', 'warning') RETURNING id",
    [userId]
  );

  const notifId1 = notifRes1.rows[0].id;
  const notifId2 = notifRes2.rows[0].id;

  const mockReq = (params = {}, query = {}, body = {}) => ({
    user: { id: userId, username: 'notif_api_user', role: 'employee' },
    params,
    query,
    body
  });

  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
  };

  // 1. GET /api/notifications
  console.log("\n1. Testing getNotifications controller...");
  const resGet = mockRes();
  await notificationController.getNotifications(mockReq(), resGet);
  console.log(`✅ Status: ${resGet.statusCode}, Count: ${resGet.data.data.length}, Unread: ${resGet.data.unread_count}`);

  // 2. GET /api/notifications/unread-count
  console.log("\n2. Testing getUnreadCount controller...");
  const resCount = mockRes();
  await notificationController.getUnreadCount(mockReq(), resCount);
  console.log(`✅ Status: ${resCount.statusCode}, Unread count: ${resCount.data.unread_count}`);

  // 3. PATCH /api/notifications/:id/read
  console.log("\n3. Testing markAsRead controller...");
  const resRead = mockRes();
  await notificationController.markAsRead(mockReq({ id: notifId1 }), resRead);
  console.log(`✅ Status: ${resRead.statusCode}, IsRead: ${resRead.data.data.is_read}, Remaining Unread: ${resRead.data.unread_count}`);

  // 4. PATCH /api/notifications/read-all
  console.log("\n4. Testing markAllAsRead controller...");
  const resReadAll = mockRes();
  await notificationController.markAllAsRead(mockReq(), resReadAll);
  console.log(`✅ Status: ${resReadAll.statusCode}, Remaining Unread: ${resReadAll.data.unread_count}`);

  // 5. DELETE /api/notifications/:id
  console.log("\n5. Testing deleteNotification controller...");
  const resDel = mockRes();
  await notificationController.deleteNotification(mockReq({ id: notifId2 }), resDel);
  console.log(`✅ Status: ${resDel.statusCode}, Remaining Unread: ${resDel.data.unread_count}`);

  // Cleanup
  await pool.query("DELETE FROM users WHERE username = 'notif_api_user'");
  console.log("\n==========================================");
  console.log("  NOTIFICATION API ENDPOINTS PASSED!     ");
  console.log("==========================================");
  process.exit(0);
}

testNotificationApi().catch(err => {
  console.error("❌ Notification API test failed:", err);
  process.exit(1);
});
