require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const userController = require('./src/controllers/userController');
const FaceProfile = require('./src/models/FaceProfile');

const JWT_SECRET = process.env.JWT_SECRET || "absenceflow_jwt_secret_key_12345";

async function runSecuritySuite() {
  console.log("==========================================");
  console.log("  Face ID Verification Security Test Suite");
  console.log("==========================================");

  // Clean test user and employee
  await pool.query("DELETE FROM users WHERE username IN ('verif_user_a', 'verif_user_b')");
  await pool.query("DELETE FROM employees WHERE email IN ('verif_a@test.local', 'verif_b@test.local')");

  // Create employee and user A
  const empResA = await pool.query(
    "INSERT INTO employees (matricule, first_name, last_name, email, hire_date) VALUES ('EMP_V_A', 'VerifA', 'Test', 'verif_a@test.local', '2026-01-01') RETURNING id"
  );
  const empAId = empResA.rows[0].id;

  const userResA = await pool.query(
    "INSERT INTO users (username, email, password_hash, role, employee_id) VALUES ('verif_user_a', 'verif_a@test.local', 'hash', 'employee', $1) RETURNING id",
    [empAId]
  );
  const userAId = userResA.rows[0].id;

  // Create employee and user B
  const empResB = await pool.query(
    "INSERT INTO employees (matricule, first_name, last_name, email, hire_date) VALUES ('EMP_V_B', 'VerifB', 'Test', 'verif_b@test.local', '2026-01-01') RETURNING id"
  );
  const empBId = empResB.rows[0].id;

  const userResB = await pool.query(
    "INSERT INTO users (username, email, password_hash, role, employee_id) VALUES ('verif_user_b', 'verif_b@test.local', 'hash', 'employee', $1) RETURNING id",
    [empBId]
  );
  const userBId = userResB.rows[0].id;

  // Setup face profile for User A
  const dummyEmbedding = Array.from({ length: 512 }, () => Math.random());
  await FaceProfile.create(empAId, dummyEmbedding);

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

  // Test 1: DELETE without verifyToken fails with 401
  console.log("\n1. Testing DELETE /api/users/me/face-id without verifyToken...");
  const resDel1 = mockRes();
  await userController.deleteMyFaceId(mockReq({ id: userAId, employee_id: empAId }), resDel1);
  console.log(`✅ Status: ${resDel1.statusCode}, Message: ${resDel1.data.message}`);
  if (resDel1.statusCode !== 401) {
    throw new Error("SECURITY FAILURE: DELETE without verifyToken should return 401!");
  }

  // Test 2: DELETE with invalid verifyToken fails with 401
  console.log("\n2. Testing DELETE /api/users/me/face-id with invalid verifyToken...");
  const resDel2 = mockRes();
  await userController.deleteMyFaceId(mockReq({ id: userAId, employee_id: empAId }, { verifyToken: 'invalid.token.here' }), resDel2);
  console.log(`✅ Status: ${resDel2.statusCode}, Message: ${resDel2.data.message}`);
  if (resDel2.statusCode !== 401) {
    throw new Error("SECURITY FAILURE: DELETE with invalid verifyToken should return 401!");
  }

  // Test 3: Generate valid verifyToken for User A
  console.log("\n3. Generating valid verifyToken for User A...");
  const tokenId = 'test-token-uuid-1';
  const validTokenA = jwt.sign(
    { employeeId: empAId, faceVerified: true, jti: tokenId },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  // Test 4: Security Mismatch: User B trying to use User A's verifyToken
  console.log("\n4. Security Check: User B using User A's verifyToken...");
  const resDelB = mockRes();
  await userController.deleteMyFaceId(mockReq({ id: userBId, employee_id: empBId }, { verifyToken: validTokenA }), resDelB);
  console.log(`✅ Status: ${resDelB.statusCode}, Message: ${resDelB.data.message}`);
  if (resDelB.statusCode !== 403) {
    throw new Error("SECURITY FAILURE: User B using User A's verifyToken should return 403!");
  }

  // Test 5: Successful DELETE for User A with valid verifyToken
  console.log("\n5. Performing DELETE for User A with valid verifyToken...");
  const resDelA = mockRes();
  await userController.deleteMyFaceId(mockReq({ id: userAId, employee_id: empAId }, { verifyToken: validTokenA }), resDelA);
  console.log(`✅ Status: ${resDelA.statusCode}, Message: ${resDelA.data.message}`);
  if (resDelA.statusCode !== 200 || resDelA.data.configured !== false) {
    throw new Error("DELETE with valid verifyToken failed!");
  }

  // Test 6: Single-use enforcement: Attempting to reuse validTokenA a second time
  console.log("\n6. Security Check: Single-use token replay attack (reusing validTokenA)...");
  const resReplay = mockRes();
  await userController.deleteMyFaceId(mockReq({ id: userAId, employee_id: empAId }, { verifyToken: validTokenA }), resReplay);
  console.log(`✅ Status: ${resReplay.statusCode}, Message: ${resReplay.data.message}`);
  if (resReplay.statusCode !== 401) {
    throw new Error("SECURITY FAILURE: Reusing single-use verifyToken should return 401!");
  }

  // Cleanup
  await pool.query("DELETE FROM users WHERE username IN ('verif_user_a', 'verif_user_b')");
  await pool.query("DELETE FROM employees WHERE email IN ('verif_a@test.local', 'verif_b@test.local')");

  console.log("\n==========================================");
  console.log("  BIOMETRIC PRE-VERIFICATION SUITE PASSED!");
  console.log("==========================================");
  process.exit(0);
}

runSecuritySuite().catch(err => {
  console.error("❌ Security suite error:", err);
  process.exit(1);
});
