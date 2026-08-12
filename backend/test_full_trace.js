const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const bcrypt = require('bcryptjs');

// Set env vars
process.env.EMAIL_HOST = 'smtp.gmail.com';
process.env.EMAIL_PORT = '465';
process.env.EMAIL_USER = 'hmidilyes607@gmail.com';
process.env.EMAIL_PASSWORD = 'qali rbyc gaee edzi';
process.env.EMAIL_FROM = 'hmidilyes607@gmail.com';

const emailService = require('./src/utils/emailService');

async function run() {
  console.log('=== Complete Email Pipeline Timestamp Trace ===\n');

  // Clean test user
  await pool.query("DELETE FROM users WHERE username = 'trace_user'");

  // Step 1: User Account Created timestamp
  const t1 = new Date().toISOString();
  console.log(`[${t1}] 👤 [Step 1 - User Created] Admin created user account in DB (username: 'trace_user', email: 'hmidilyes607@gmail.com')`);

  // Step 2: Activation Token Generated timestamp
  const crypto = require('crypto');
  const activationToken = crypto.randomBytes(32).toString('hex');
  const activationExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const t2 = new Date().toISOString();
  console.log(`[${t2}] 🔑 [Step 2 - Token Generated] Activation token generated: ${activationToken.substring(0, 10)}... (Expires: ${activationExpiry.toISOString()})`);

  // Insert test user to DB
  const passHash = 'PENDING_ACTIVATION_' + crypto.randomBytes(16).toString('hex');
  await pool.query(
    "INSERT INTO users (username, email, password_hash, role, account_status, is_verified, is_active, activation_token, activation_token_expiry) VALUES ('trace_user', 'hmidilyes607@gmail.com', $1, 'manager', 'Pending Activation', false, true, $2, $3)",
    [passHash, activationToken, activationExpiry]
  );

  const activationLink = `http://localhost:5173/activate-account?token=${activationToken}`;

  // Step 3, 4, 5: Email Sending Started -> Provider Accepted -> Delivery Completed
  const success = await emailService.sendActivationEmail('hmidilyes607@gmail.com', 'trace_user', activationLink);

  console.log(`\nEmail delivery successful? ${success}`);

  // Cleanup
  await pool.query("DELETE FROM users WHERE username = 'trace_user'");
  console.log('=== Trace Test Complete ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('Trace error:', err);
  process.exit(1);
});
