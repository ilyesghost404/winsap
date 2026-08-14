const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "absenceflow_jwt_secret_key_12345";

function testEmployeesEndpoint() {
  console.log("Testing live /api/employees GET endpoint...");

  const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/employees?limit=10',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      console.log(`GET /api/employees Status: ${res.statusCode}`);
      const json = JSON.parse(data);
      console.log(`Success: ${json.success}, Total Employees: ${json.total}`);
      json.data.forEach(e => {
        console.log(`- Employee ${e.id} (${e.first_name} ${e.last_name}): biometric_status='${e.biometric_status}', is_face_enrolled=${e.is_face_enrolled}`);
      });
      if (res.statusCode === 200 && json.success) {
        console.log("✅ LIVE /api/employees GET TEST PASSED!");
        process.exit(0);
      } else {
        console.error("❌ GET /api/employees failed");
        process.exit(1);
      }
    });
  });

  req.on('error', err => {
    console.error("❌ Live HTTP error:", err.message);
    process.exit(1);
  });

  req.end();
}

testEmployeesEndpoint();
