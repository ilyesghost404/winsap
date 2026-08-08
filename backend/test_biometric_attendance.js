const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const API_URL = 'http://127.0.0.1:5000/api';

async function run() {
  console.log('🚀 Starting Biometric check-in/out verification tests...');

  let originalEmbedding = null;
  const employeeId = 4; // ilyes_benhmid

  try {
    // 1. Read test face image file
    const realFacePath = path.join(__dirname, 'Silent-Face-Anti-Spoofing', 'images', 'sample', 'image_T1.jpg');

    if (!fs.existsSync(realFacePath)) {
      throw new Error(`Sample face image not found at: \n  ${realFacePath}`);
    }

    const realFaceBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(realFacePath).toString('base64');
    console.log('✅ Sample face image loaded.');

    // 2. Fetch the embedding for the face from the AI service
    console.log('📡 Calling Local AI Service to generate embedding...');
    const aiEmbedRes = await fetch('http://localhost:5001/api/ai/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: realFaceBase64 })
    });

    const aiEmbedData = await aiEmbedRes.json();
    if (!aiEmbedRes.ok || !aiEmbedData.success) {
      throw new Error(`AI embedding call failed: ${JSON.stringify(aiEmbedData)}`);
    }
    const newEmbedding = aiEmbedData.embedding;
    console.log('✅ Generated embedding successfully.');

    // 3. Backup original embedding from DB and delete today's attendance for employee 4
    const dbRes = await pool.query('SELECT face_embedding FROM face_profiles WHERE employee_id = $1', [employeeId]);
    if (dbRes.rows.length === 0) {
      throw new Error(`No face profile found for employee ID ${employeeId}`);
    }
    originalEmbedding = dbRes.rows[0].face_embedding;
    
    await pool.query('DELETE FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE', [employeeId]);
    console.log('💾 Database cleared of today\'s attendance. Face profile backed up.');

    // 4. Temporarily update the face profile embedding in the DB
    await pool.query('UPDATE face_profiles SET face_embedding = $1::jsonb WHERE employee_id = $2', [JSON.stringify(newEmbedding), employeeId]);

    // 5. Authenticate via Face ID Login to get the Employee's JWT
    console.log('🔑 Authenticating user ilyes_benhmid via Face ID Login...');
    const loginRes = await fetch(`${API_URL}/users/face-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: realFaceBase64 })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Face Login failed: ${JSON.stringify(loginData)}`);
    }
    const userToken = loginData.data.token;
    console.log('✅ Face Login successful. Token retrieved.');

    // 6. Test Case 1: Biometric Check-In (Success)
    console.log('\n📥 Test Case 1: Testing Biometric Check-In...');
    const checkInRes = await fetch(`${API_URL}/presence/check-in-face`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ image: realFaceBase64 })
    });

    const checkInData = await checkInRes.json();
    console.log('→ Check-In Status:', checkInRes.status);
    console.log('→ Check-In Response:', JSON.stringify(checkInData, null, 2));

    if (checkInRes.status === 200 && checkInData.success) {
      console.log('✅ Biometric Check-In API succeeded.');
    } else {
      throw new Error(`Biometric Check-In failed: ${JSON.stringify(checkInData)}`);
    }

    // 7. Verify Check-In Database Record
    const { rows: attRows } = await pool.query(
      'SELECT face_verified, qr_verified, verification_method FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE',
      [employeeId]
    );
    console.log('→ Database Attendance Row:', attRows[0]);
    if (attRows[0] && attRows[0].face_verified && !attRows[0].qr_verified && attRows[0].verification_method === 'AI_FACE') {
      console.log('✅ Database assertions passed: face_verified = true, qr_verified = false, verification_method = "AI_FACE"');
    } else {
      throw new Error('Database assertions failed!');
    }

    // 8. Test Case 2: Double Check-In Prevention
    console.log('\n🛡️ Test Case 2: Testing Double Check-In Prevention...');
    const doubleRes = await fetch(`${API_URL}/presence/check-in-face`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ image: realFaceBase64 })
    });
    const doubleData = await doubleRes.json();
    console.log('→ Double Check-In Status:', doubleRes.status);
    console.log('→ Double Check-In Response:', JSON.stringify(doubleData, null, 2));

    if (doubleRes.status === 400 && !doubleData.success && doubleData.message.includes('already checked in')) {
      console.log('✅ Double check-in successfully blocked.');
    } else {
      throw new Error('Double check-in should have failed');
    }

    // 9. Test Case 3: Biometric Check-Out (Success)
    console.log('\n📤 Test Case 3: Testing Biometric Check-Out...');
    const checkOutRes = await fetch(`${API_URL}/presence/check-out-face`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ image: realFaceBase64 })
    });

    const checkOutData = await checkOutRes.json();
    console.log('→ Check-Out Status:', checkOutRes.status);
    console.log('→ Check-Out Response:', JSON.stringify(checkOutData, null, 2));

    if (checkOutRes.status === 200 && checkOutData.success) {
      console.log('✅ Biometric Check-Out API succeeded.');
    } else {
      throw new Error(`Biometric Check-Out failed: ${JSON.stringify(checkOutData)}`);
    }

  } catch (error) {
    console.error('\n❌ Biometric check-in/out tests failed:', error.message);
    process.exitCode = 1;
  } finally {
    // 10. Restore the original embedding and delete test attendance
    await pool.query('DELETE FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE', [employeeId]);
    if (originalEmbedding) {
      console.log('\n🧼 Restoring original face profile embedding...');
      try {
        await pool.query('UPDATE face_profiles SET face_embedding = $1::jsonb WHERE employee_id = $2', [
          typeof originalEmbedding === 'string' ? originalEmbedding : JSON.stringify(originalEmbedding),
          employeeId
        ]);
        console.log('✅ Original embedding restored.');
      } catch (err) {
        console.error('❌ Failed to restore original embedding:', err.message);
      }
    }
    await pool.end();
    console.log('🏁 Verification finished.');
  }
}

run();
