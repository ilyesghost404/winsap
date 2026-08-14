require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function testActivationFlow() {
  console.log("==========================================");
  console.log("  Testing Activation Token & Account Flow");
  console.log("==========================================");

  // Clean previous test user
  await pool.query("DELETE FROM users WHERE username = 'brevo_test_user' OR email = 'brevo_flow_test@winsap.local'");

  // Step 1: Generate activation token
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const pendingPass = 'PENDING_ACTIVATION_' + crypto.randomBytes(16).toString('hex');

  console.log(`\n1. Creating pending activation user in DB (Token: ${token.substring(0, 10)}...)...`);
  const res = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, account_status, is_verified, is_active, activation_token, activation_token_expiry)
     VALUES ('brevo_test_user', 'brevo_flow_test@winsap.local', $1, 'employee', 'Pending Activation', false, true, $2, $3)
     RETURNING id, username, email`,
    [pendingPass, token, expiry]
  );
  const user = res.rows[0];
  console.log(`✅ User created! ID: ${user.id}, Username: ${user.username}`);

  // Step 2: Verify Activation Token
  console.log("\n2. Verifying activation token in model...");
  const check = await User.checkActivationToken(token);
  console.log(`✅ Token status: ${check.status}, User: ${check.user?.username}`);
  if (check.status !== 'valid') {
    throw new Error(`Token check failed: ${check.message}`);
  }

  // Step 3: Activate Account with new password
  console.log("\n3. Activating account with new password...");
  const newPassHash = await bcrypt.hash("SecureP@ssword123!", 10);
  await User.activateAccount(user.id, newPassHash);

  const activatedUser = await User.getById(user.id);
  console.log(`✅ Account activated! Status: ${activatedUser.account_status}, Verified: ${activatedUser.is_verified}`);

  // Cleanup
  await pool.query("DELETE FROM users WHERE username = 'brevo_test_user' OR email = 'brevo_flow_test@winsap.local'");
  console.log("\n==========================================");
  console.log("  ACTIVATION FLOW VERIFICATION PASSED");
  console.log("==========================================");
  process.exit(0);
}

testActivationFlow().catch(err => {
  console.error("❌ Activation test failed:", err);
  process.exit(1);
});
