const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const bcrypt = require('bcryptjs');

async function run() {
  console.log('=== Measuring Full Email Delivery Speed & Timestamps ===\n');

  // Clean test user & admin
  await pool.query("DELETE FROM users WHERE username IN ('speed_test_admin', 'speed_test_user') OR email = 'hmidilyes607@gmail.com'");

  // Admin creation
  const adminPass = await bcrypt.hash('Password123!', 10);
  await pool.query(
    "INSERT INTO users (username, email, password_hash, role, is_verified, is_active, account_status) VALUES ('speed_test_admin', 'admin@test.local', $1, 'admin', true, true, 'Active')",
    [adminPass]
  );

  const loginRes = await fetch('http://127.0.0.1:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'speed_test_admin', password: 'Password123!' })
  });
  
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Admin login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.data.token;

  const tStart = Date.now();
  console.log(`[${new Date().toISOString()}] 🚀 Initiating User Creation API Request...`);

  const createRes = await fetch('http://127.0.0.1:5000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      username: 'speed_test_user',
      email: 'hmidilyes607@gmail.com',
      role: 'manager'
    })
  });

  const apiDuration = Date.now() - tStart;
  const createData = await createRes.json();

  console.log(`[${new Date().toISOString()}] ⚡ API Creation Response returned in ${apiDuration} ms (Success: ${createData.success})`);

  if (!createData.success) {
    console.error('Create user error payload:', createData);
    process.exit(1);
  }

  // Wait 10 seconds to observe async email delivery logs
  console.log(`\nWaiting 10s for SMTP provider delivery logs...`);
  await new Promise((r) => setTimeout(r, 10000));

  // Cleanup
  await pool.query("DELETE FROM users WHERE username IN ('speed_test_admin', 'speed_test_user') OR email = 'hmidilyes607@gmail.com'");
  console.log('\n=== Speed Test Completed ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('Speed test error:', err);
  process.exit(1);
});
