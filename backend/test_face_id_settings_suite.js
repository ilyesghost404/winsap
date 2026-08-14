require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const userController = require('./src/controllers/userController');
const FaceProfile = require('./src/models/FaceProfile');

const JWT_SECRET = process.env.JWT_SECRET || "absenceflow_jwt_secret_key_12345";

async function runFaceIdSuite() {
  console.log("==========================================");
  console.log("  WinSAP Settings Face ID Test Suite     ");
  console.log("==========================================");

  // Clean test user and employee
  await pool.query("DELETE FROM users WHERE username IN ('face_test_user_a', 'face_test_user_b')");
  await pool.query("DELETE FROM employees WHERE email IN ('face_a@test.local', 'face_b@test.local')");

  // Create employee and user A
  const empResA = await pool.query(
    "INSERT INTO employees (matricule, first_name, last_name, email, hire_date) VALUES ('EMP_FACE_A', 'FaceA', 'Test', 'face_a@test.local', '2026-01-01') RETURNING id"
  );
  const empAId = empResA.rows[0].id;

  const userResA = await pool.query(
    "INSERT INTO users (username, email, password_hash, role, employee_id) VALUES ('face_test_user_a', 'face_a@test.local', 'hash', 'employee', $1) RETURNING id",
    [empAId]
  );
  const userAId = userResA.rows[0].id;

  // Create employee and user B
  const empResB = await pool.query(
    "INSERT INTO employees (matricule, first_name, last_name, email, hire_date) VALUES ('EMP_FACE_B', 'FaceB', 'Test', 'face_b@test.local', '2026-01-01') RETURNING id"
  );
  const empBId = empResB.rows[0].id;

  const userResB = await pool.query(
    "INSERT INTO users (username, email, password_hash, role, employee_id) VALUES ('face_test_user_b', 'face_b@test.local', 'hash', 'employee', $1) RETURNING id",
    [empBId]
  );
  const userBId = userResB.rows[0].id;

  console.log(`✅ Test User A created: User ID ${userAId}, Employee ID ${empAId}`);
  console.log(`✅ Test User B created: User ID ${userBId}, Employee ID ${empBId}`);

  const mockReq = (user, body = {}) => ({
    user,
    body
  });

  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
  };

  // 1. GET /api/users/me/face-id when not configured
  console.log("\n1. GET /api/users/me/face-id (Not configured)...");
  const resGet1 = mockRes();
  await userController.getMyFaceIdStatus(mockReq({ id: userAId, employee_id: empAId }), resGet1);
  console.log(`✅ Status: ${resGet1.statusCode}, Configured: ${resGet1.data.configured}, Status: ${resGet1.data.status}`);
  if (resGet1.data.configured !== false) {
    throw new Error("Expected configured to be false");
  }

  // 2. Create face profile for User A directly
  console.log("\n2. Creating Face Profile for User A...");
  const dummyEmbedding = Array.from({ length: 512 }, () => Math.random());
  await FaceProfile.create(empAId, dummyEmbedding);

  // 3. GET /api/users/me/face-id when configured
  console.log("\n3. GET /api/users/me/face-id (Configured)...");
  const resGet2 = mockRes();
  await userController.getMyFaceIdStatus(mockReq({ id: userAId, employee_id: empAId }), resGet2);
  console.log(`✅ Status: ${resGet2.statusCode}, Configured: ${resGet2.data.configured}, RegisteredAt: ${resGet2.data.registeredAt}`);
  if (resGet2.data.configured !== true) {
    throw new Error("Expected configured to be true");
  }

  // 4. Security Check: User B's token cannot affect User A's profile
  console.log("\n4. Security Isolation Check (User B fetching own status vs User A)...");
  const resGetB = mockRes();
  await userController.getMyFaceIdStatus(mockReq({ id: userBId, employee_id: empBId }), resGetB);
  console.log(`✅ User B Configured Status: ${resGetB.data.configured}`);
  if (resGetB.data.configured !== false) {
    throw new Error("User B should not have User A's face profile!");
  }

  // 5. DELETE /api/users/me/face-id for User A
  console.log("\n5. DELETE /api/users/me/face-id for User A...");
  const resDel = mockRes();
  await userController.deleteMyFaceId(mockReq({ id: userAId, employee_id: empAId }), resDel);
  console.log(`✅ Status: ${resDel.statusCode}, Configured: ${resDel.data.configured}`);

  // 6. Verify User A status after delete
  console.log("\n6. Verification after deletion...");
  const resGet3 = mockRes();
  await userController.getMyFaceIdStatus(mockReq({ id: userAId, employee_id: empAId }), resGet3);
  console.log(`✅ Status: ${resGet3.statusCode}, Configured: ${resGet3.data.configured}`);
  if (resGet3.data.configured !== false) {
    throw new Error("Expected configured to be false after deletion!");
  }

  // Cleanup
  await pool.query("DELETE FROM users WHERE username IN ('face_test_user_a', 'face_test_user_b')");
  await pool.query("DELETE FROM employees WHERE email IN ('face_a@test.local', 'face_b@test.local')");
  console.log("\n==========================================");
  console.log("  SETTINGS FACE ID SUITE PASSED SUCCESSFULLY!");
  console.log("==========================================");
  process.exit(0);
}

runFaceIdSuite().catch(err => {
  console.error("❌ Face ID suite error:", err);
  process.exit(1);
});
