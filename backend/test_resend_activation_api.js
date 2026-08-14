require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const userController = require('./src/controllers/userController');

async function testResendActivationApi() {
  console.log("=================================================");
  console.log("  Testing Resend Activation Error Response ");
  console.log("=================================================");

  // Fetch or create a test user
  let userRes = await pool.query("SELECT id, email, username FROM users WHERE account_status = 'Pending Activation' LIMIT 1");
  let testUser;

  if (userRes.rows.length === 0) {
    const insertRes = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, account_status, is_verified, is_active, activation_token)
       VALUES ('resend_test_user', 'resend_test@winsap.local', 'PENDING', 'employee', 'Pending Activation', false, true, 'dummy_token')
       RETURNING id, email, username`
    );
    testUser = insertRes.rows[0];
  } else {
    testUser = userRes.rows[0];
  }

  console.log(`\nTesting resendActivationEmail controller for User ID ${testUser.id} (${testUser.email})...`);

  // Mock req and res objects
  const req = {
    body: { userId: testUser.id },
    user: { id: testUser.id, username: testUser.username },
    ip: '127.0.0.1',
    headers: {},
    socket: {}
  };

  let statusCode = 200;
  let jsonResponse = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    }
  };

  await userController.resendActivationEmail(req, res);

  console.log(`\nController HTTP Status: ${statusCode}`);
  console.log("Controller JSON Response:", JSON.stringify(jsonResponse, null, 2));

  if (statusCode === 500 && jsonResponse && jsonResponse.success === false) {
    console.log("\n✅ SUCCESS: Backend correctly returned HTTP 500 with useful error message instead of hanging!");
  } else {
    console.error("\n❌ FAILED: Controller did not return expected 500 error response.");
  }

  // Cleanup test user if we created one
  await pool.query("DELETE FROM users WHERE username = 'resend_test_user'");
  process.exit(0);
}

testResendActivationApi().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
