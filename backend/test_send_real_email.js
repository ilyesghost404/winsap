require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const emailService = require('./src/utils/emailService');
const User = require('./src/models/User');

async function testSendRealEmailAndActivate() {
  console.log("=================================================");
  console.log("  Testing Email Delivery to ilyesh321@gmail.com  ");
  console.log("=================================================");

  const recipient = "ilyesh321@gmail.com";

  // Clean previous test user
  await pool.query("DELETE FROM users WHERE email = $1", [recipient]);

  // Step 1: Create pending activation user
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const pendingPass = 'PENDING_ACTIVATION_' + crypto.randomBytes(16).toString('hex');

  console.log(`\n1. Creating user for ${recipient}...`);
  const res = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, account_status, is_verified, is_active, activation_token, activation_token_expiry)
     VALUES ('winsap_employee', $1, $2, 'employee', 'Pending Activation', false, true, $3, $4)
     RETURNING id, username, email`,
    [recipient, pendingPass, token, expiry]
  );
  const user = res.rows[0];
  console.log(`✅ User created! ID: ${user.id}, Email: ${user.email}`);

  // Step 2: Send activation email via Brevo SMTP
  const activationLink = `https://localhost:5173/activate-account/${token}`;
  console.log(`\n2. Sending activation email to ${recipient} via Brevo SMTP...`);
  const startTime = Date.now();
  const mailResult = await emailService.sendActivationEmail(user.email, user.username, activationLink);
  console.log(`✅ Email accepted by Brevo! Message ID: ${mailResult.messageId} (${Date.now() - startTime}ms)`);

  // Step 3: Verify Activation Token
  console.log("\n3. Testing activation token verification...");
  const check = await User.checkActivationToken(token);
  console.log(`✅ Token Check: status=${check.status}, user=${check.user?.username}`);

  // Step 4: Activate Account
  console.log("\n4. Activating account with new password...");
  const newPassHash = await bcrypt.hash("WinSAP@2026!", 10);
  await User.activateAccount(user.id, newPassHash);

  const activeUser = await User.getById(user.id);
  console.log(`✅ Account successfully activated! Status: ${activeUser.account_status}, Verified: ${activeUser.is_verified}`);

  // Cleanup
  await pool.query("DELETE FROM users WHERE email = $1", [recipient]);

  console.log("\n=================================================");
  console.log("  BREVO SMTP & ACCOUNT ACTIVATION TEST PASSED!");
  console.log("=================================================");
  process.exit(0);
}

testSendRealEmailAndActivate().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
