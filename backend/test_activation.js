const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const bcrypt = require('bcryptjs');

async function run() {
  console.log('--- Comprehensive Account Activation Flow & Error Handling Test ---');

  // Cleanup past test data
  await pool.query("DELETE FROM users WHERE username IN ('testadmin_act', 'testuser_act')");
  await pool.query("DELETE FROM employees WHERE matricule = 'EMP-ACT-001'");

  // Step 1: Create Admin user
  const adminPass = await bcrypt.hash('Password123!', 10);
  await pool.query(
    "INSERT INTO users (username, email, password_hash, role, is_verified, is_active, account_status) VALUES ('testadmin_act', 'testadmin_act@test.local', $1, 'admin', true, true, 'Active')",
    [adminPass]
  );

  const loginRes = await fetch('http://127.0.0.1:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testadmin_act', password: 'Password123!' })
  });
  
  const loginData = await loginRes.json();
  if (!loginData.success) {
    console.error('Admin login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.data.token;
  console.log('✓ Admin authenticated');

  // Step 2: Manager creates employee record
  const empRes = await pool.query(
    "INSERT INTO employees (matricule, first_name, last_name, department_id, position, hire_date) VALUES ('EMP-ACT-001', 'David', 'Beckham', NULL, 'Brand Manager', CURRENT_DATE) RETURNING id"
  );
  const employeeId = empRes.rows[0].id;
  console.log(`✓ Manager created Employee profile (ID: ${employeeId})`);

  // Step 3: Admin creates User Account linked to employee
  const createRes = await fetch('http://127.0.0.1:5000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      username: 'testuser_act',
      email: 'david.beckham@test.local',
      role: 'employee',
      employee_id: employeeId
    })
  });
  const createData = await createRes.json();
  if (!createData.success) {
    console.error('Create user failed:', createData);
    process.exit(1);
  }
  console.log('✓ Admin created User Account (Pending Activation)');

  // Step 4: Extract token
  const { rows } = await pool.query("SELECT id, activation_token FROM users WHERE username = 'testuser_act'");
  const activationToken = rows[0].activation_token;
  const userId = rows[0].id;

  // Test Case A: Invalid Token Test
  const invalidRes = await fetch('http://127.0.0.1:5000/api/users/activate-account/verify?token=NON_EXISTENT_TOKEN_123');
  const invalidData = await invalidRes.json();
  if (invalidData.success || invalidData.reason !== 'invalid') {
    console.error('Invalid token test failed:', invalidData);
    process.exit(1);
  }
  console.log('✓ Invalid token verification test passed (Reason: invalid)');

  // Test Case B: Valid Token Test
  const validRes = await fetch(`http://127.0.0.1:5000/api/users/activate-account/verify?token=${activationToken}`);
  const validData = await validRes.json();
  if (!validData.success) {
    console.error('Valid token verification failed:', validData);
    process.exit(1);
  }
  console.log('✓ Valid token verification test passed');

  // Test Case C: Expired Token Test
  await pool.query("UPDATE users SET activation_token_expiry = NOW() - INTERVAL '1 hour' WHERE id = $1", [userId]);
  const expiredRes = await fetch(`http://127.0.0.1:5000/api/users/activate-account/verify?token=${activationToken}`);
  const expiredData = await expiredRes.json();
  if (expiredData.success || expiredData.reason !== 'expired') {
    console.error('Expired token test failed:', expiredData);
    process.exit(1);
  }
  console.log('✓ Expired token test passed (Reason: expired)');

  // Reset token expiry for actual activation
  await pool.query("UPDATE users SET activation_token_expiry = NOW() + INTERVAL '24 hours' WHERE id = $1", [userId]);

  // Step 5: Activate Account & Set Password
  const activateRes = await fetch('http://127.0.0.1:5000/api/users/activate-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: activationToken, password: 'SecurePassword123!' })
  });
  const activateData = await activateRes.json();
  if (!activateData.success) {
    console.error('Account activation failed:', activateData);
    process.exit(1);
  }
  console.log('✓ Account activated successfully (Password set)');

  // Test Case D: Already Activated Token Test
  // Put token back temporarily to test re-using
  await pool.query("UPDATE users SET activation_token = $1 WHERE id = $2", [activationToken, userId]);
  const alreadyRes = await fetch(`http://127.0.0.1:5000/api/users/activate-account/verify?token=${activationToken}`);
  const alreadyData = await alreadyRes.json();
  if (alreadyData.success || alreadyData.reason !== 'already_activated') {
    console.error('Already activated token test failed:', alreadyData);
    process.exit(1);
  }
  console.log('✓ Already activated token test passed (Reason: already_activated)');

  // Clear activation token back
  await pool.query("UPDATE users SET activation_token = NULL WHERE id = $1", [userId]);

  // Step 6: Verify Employee Login
  const empLoginRes = await fetch('http://127.0.0.1:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser_act', password: 'SecurePassword123!' })
  });
  const empLoginData = await empLoginRes.json();
  if (!empLoginData.success) {
    console.error('Employee login failed after activation:', empLoginData);
    process.exit(1);
  }
  console.log('✓ Activated employee logged in successfully!');

  // Cleanup
  await pool.query("DELETE FROM users WHERE username IN ('testadmin_act', 'testuser_act')");
  await pool.query("DELETE FROM employees WHERE matricule = 'EMP-ACT-001'");
  console.log('--- All Activation Flow & Error Handling Tests Passed! ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
