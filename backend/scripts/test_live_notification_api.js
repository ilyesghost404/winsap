const http = require('http');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const JWT_SECRET = process.env.JWT_SECRET || "absenceflow_jwt_secret_key_12345";

async function testLiveApi() {
  console.log("Testing live notification HTTP endpoint on port 5000...");

  // Fetch an active user
  const userRes = await pool.query("SELECT id, username, role FROM users LIMIT 1");
  if (userRes.rows.length === 0) {
    console.error("No user found in DB");
    process.exit(1);
  }
  const user = userRes.rows[0];
  console.log(`User: ID ${user.id}, Username: ${user.username}`);

  // Generate valid JWT
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  // Make HTTP request to http://127.0.0.1:5000/api/notifications
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/notifications',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`HTTP Response Status: ${res.statusCode}`);
      console.log(`HTTP Response Data: ${data}`);
      if (res.statusCode === 200) {
        console.log("✅ LIVE /api/notifications ENDPOINT REACHED SUCCESSFULLY!");
        process.exit(0);
      } else {
        console.error("❌ HTTP request failed");
        process.exit(1);
      }
    });
  });

  req.on('error', (err) => {
    console.error("❌ Live HTTP error:", err.message);
    process.exit(1);
  });

  req.end();
}

testLiveApi();
