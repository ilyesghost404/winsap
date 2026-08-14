const http = require('http');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const JWT_SECRET = process.env.JWT_SECRET || "absenceflow_jwt_secret_key_12345";

async function testLiveFaceIdApi() {
  console.log("Testing live /api/users/me/face-id HTTP endpoint on port 5000...");

  const userRes = await pool.query("SELECT id, username, role, employee_id FROM users WHERE employee_id IS NOT NULL LIMIT 1");
  if (userRes.rows.length === 0) {
    console.error("No user with employee_id found");
    process.exit(1);
  }
  const user = userRes.rows[0];
  console.log(`User: ID ${user.id}, Username: ${user.username}, Employee ID: ${user.employee_id}`);

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role, employee_id: user.employee_id }, JWT_SECRET, { expiresIn: '1h' });

  // GET /api/users/me/face-id
  const optionsGet = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/users/me/face-id',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const reqGet = http.request(optionsGet, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`GET /api/users/me/face-id Status: ${res.statusCode}`);
      console.log(`Response Data: ${data}`);
      if (res.statusCode === 200) {
        console.log("✅ LIVE /api/users/me/face-id GET SUCCESSFUL!");
        process.exit(0);
      } else {
        console.error("❌ GET /api/users/me/face-id failed");
        process.exit(1);
      }
    });
  });

  reqGet.on('error', (err) => {
    console.error("❌ Live HTTP error:", err.message);
    process.exit(1);
  });

  reqGet.end();
}

testLiveFaceIdApi();
