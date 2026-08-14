require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const Notification = require('./src/models/Notification');
const notificationService = require('./src/services/notificationService');

async function runNotificationsSuite() {
  console.log("==========================================");
  console.log("  WinSAP Real-Time Notifications Test Suite ");
  console.log("==========================================");

  // Clean test data
  await pool.query("DELETE FROM users WHERE username IN ('notif_user_a', 'notif_user_b')");

  // Create test users A and B
  console.log("\n1. Setting up test users A & B...");
  const resA = await pool.query(
    "INSERT INTO users (username, email, password_hash, role) VALUES ('notif_user_a', 'user_a@test.local', 'hash', 'employee') RETURNING id"
  );
  const userAId = resA.rows[0].id;

  const resB = await pool.query(
    "INSERT INTO users (username, email, password_hash, role) VALUES ('notif_user_b', 'user_b@test.local', 'hash', 'manager') RETURNING id"
  );
  const userBId = resB.rows[0].id;

  console.log(`✅ User A ID: ${userAId}, User B ID: ${userBId}`);

  // Test 1: Create notifications via notificationService
  console.log("\n2. Creating notifications via notificationService...");
  const notif1 = await notificationService.createNotification(
    userAId,
    "Leave Request Approved",
    "Your vacation request from 2026-08-20 to 2026-08-25 was approved.",
    "success",
    101,
    "absence"
  );

  const notif2 = await notificationService.createNotification(
    userAId,
    "Holiday Reminder",
    "Upcoming official company holiday tomorrow.",
    "info",
    null,
    null
  );

  const notifB = await notificationService.createNotification(
    userBId,
    "New Leave Request",
    "Employee submitted leave request for review.",
    "warning",
    102,
    "absence"
  );

  console.log(`✅ Notification 1 created ID: ${notif1.id} for User A`);
  console.log(`✅ Notification 2 created ID: ${notif2.id} for User A`);
  console.log(`✅ Notification B created ID: ${notifB.id} for User B`);

  // Test 2: Unread Count Check
  console.log("\n3. Testing unread count...");
  let countA = await Notification.getUnreadCount(userAId);
  let countB = await Notification.getUnreadCount(userBId);
  console.log(`✅ User A unread count: ${countA} (Expected: 2)`);
  console.log(`✅ User B unread count: ${countB} (Expected: 1)`);

  if (countA !== 2 || countB !== 1) {
    throw new Error("Unread count mismatch!");
  }

  // Test 3: Get By User ID (Ordering Newest to Oldest)
  console.log("\n4. Testing GET notifications ordered newest to oldest...");
  const listA = await Notification.getByUserId(userAId);
  console.log(`✅ User A notifications count: ${listA.length}`);
  if (listA[0].id !== notif2.id) {
    throw new Error("Notifications are not ordered newest first!");
  }

  // Test 4: Mark single notification as read
  console.log("\n5. Marking Notification 1 as read for User A...");
  const updated1 = await Notification.markAsRead(notif1.id, userAId);
  console.log(`✅ Updated notification 1: is_read=${updated1.is_read}, read_at=${updated1.read_at}`);

  countA = await Notification.getUnreadCount(userAId);
  console.log(`✅ User A unread count after 1 read: ${countA} (Expected: 1)`);

  // Test 5: Security isolation check (User B cannot mark User A's notification as read)
  console.log("\n6. Security Check: User B attempting to mark User A's notification as read...");
  const unauthorizedUpdate = await Notification.markAsRead(notif2.id, userBId);
  console.log(`✅ Unauthorized update result: ${unauthorizedUpdate}`);
  if (unauthorizedUpdate !== null) {
    throw new Error("SECURITY FAILURE: User B was able to modify User A's notification!");
  }

  // Test 6: Mark all read for User A
  console.log("\n7. Marking all as read for User A...");
  await Notification.markAllAsRead(userAId);
  countA = await Notification.getUnreadCount(userAId);
  console.log(`✅ User A unread count after markAllAsRead: ${countA} (Expected: 0)`);

  // Test 7: Delete notification
  console.log("\n8. Deleting notification 1 for User A...");
  const deleted = await Notification.delete(notif1.id, userAId);
  console.log(`✅ Notification 1 deleted: ${deleted}`);

  const remainingA = await Notification.getByUserId(userAId);
  console.log(`✅ User A remaining notifications: ${remainingA.length} (Expected: 1)`);

  // Cleanup
  await pool.query("DELETE FROM users WHERE username IN ('notif_user_a', 'notif_user_b')");
  console.log("\n==========================================");
  console.log("  ALL NOTIFICATION TESTS PASSED SUCCESSFULLY");
  console.log("==========================================");
  process.exit(0);
}

runNotificationsSuite().catch(err => {
  console.error("❌ Notifications suite error:", err);
  process.exit(1);
});
