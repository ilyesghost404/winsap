const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ host: 'localhost', port: 5432, database: 'absenceflow', user: 'postgres', password: '1289' });
const API_URL = 'http://127.0.0.1:5000/api';

async function run() {
  console.log('🚀 Starting Backend Face ID Login verification...');

  let originalEmbedding = null;
  const employeeId = 4; // ilyes_benhmid

  try {
    // 1. Read test face image files
    const realFacePath = path.join(__dirname, 'Silent-Face-Anti-Spoofing', 'images', 'sample', 'image_T1.jpg');
    const diffFacePath = path.join(__dirname, 'Silent-Face-Anti-Spoofing', 'images', 'sample', 'image_F1.jpg');

    if (!fs.existsSync(realFacePath) || !fs.existsSync(diffFacePath)) {
      throw new Error(`Sample face images not found at: \n  ${realFacePath}\n  ${diffFacePath}`);
    }

    const realFaceBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(realFacePath).toString('base64');
    const diffFaceBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(diffFacePath).toString('base64');
    
    // 1x1 transparent PNG to simulate a valid image format that contains no face
    const invalidImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    console.log('✅ Sample images loaded and encoded successfully.');

    // 2. Fetch the embedding for the real face from the AI service
    console.log('📡 Calling Local AI Service to generate embedding for the real face...');
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

    // 3. Backup original embedding from DB
    const dbRes = await pool.query('SELECT face_embedding FROM face_profiles WHERE employee_id = $1', [employeeId]);
    if (dbRes.rows.length === 0) {
      throw new Error(`No face profile found for employee ID ${employeeId}`);
    }
    originalEmbedding = dbRes.rows[0].face_embedding;
    console.log('💾 Backed up original face profile embedding.');

    // 4. Temporarily update the face profile embedding in the DB
    console.log('✏️ Temporarily writing test embedding to database...');
    await pool.query('UPDATE face_profiles SET face_embedding = $1::jsonb WHERE employee_id = $2', [JSON.stringify(newEmbedding), employeeId]);

    // 5. Test Case 1: Valid Face ID Login
    console.log('\n🔒 Test Case 1: Testing valid Face ID login...');
    const validLoginRes = await fetch(`${API_URL}/users/face-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: realFaceBase64 })
    });

    const validLoginData = await validLoginRes.json();
    console.log('→ Valid Login Response status:', validLoginRes.status);
    console.log('→ Valid Login Response body:', JSON.stringify(validLoginData, null, 2));

    if (validLoginRes.status === 200 && validLoginData.success && validLoginData.data.token) {
      console.log('✅ Valid Face ID login passed. Returned JWT Token successfully.');
    } else {
      throw new Error(`Valid Face ID login failed: ${JSON.stringify(validLoginData)}`);
    }

    // 6. Test Case 2: Mismatch Face Login
    console.log('\n❌ Test Case 2: Testing mismatch Face ID login...');
    const mismatchLoginRes = await fetch(`${API_URL}/users/face-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: diffFaceBase64 })
    });

    const mismatchLoginData = await mismatchLoginRes.json();
    console.log('→ Mismatch Login Response status:', mismatchLoginRes.status);
    console.log('→ Mismatch Login Response body:', JSON.stringify(mismatchLoginData, null, 2));

    if (mismatchLoginRes.status === 400 && !mismatchLoginData.success && mismatchLoginData.reason === 'FACE_NOT_MATCHED') {
      console.log('✅ Mismatch Face ID login successfully blocked by face recognition.');
    } else {
      throw new Error(`Mismatch Face ID login should have failed with FACE_NOT_MATCHED, but got status ${mismatchLoginRes.status}: ${JSON.stringify(mismatchLoginData)}`);
    }

    // 7. Test Case 3: Invalid Image (Face Not Detected)
    console.log('\n❌ Test Case 3: Testing invalid image input...');
    const invalidLoginRes = await fetch(`${API_URL}/users/face-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: invalidImageBase64 })
    });

    const invalidLoginData = await invalidLoginRes.json();
    console.log('→ Invalid Image Response status:', invalidLoginRes.status);
    console.log('→ Invalid Image Response body:', JSON.stringify(invalidLoginData, null, 2));

    if (invalidLoginRes.status === 400 && !invalidLoginData.success && invalidLoginData.reason === 'FACE_NOT_DETECTED') {
      console.log('✅ Invalid image successfully blocked by face detector.');
    } else {
      throw new Error(`Invalid image should have failed with FACE_NOT_DETECTED, but got status ${invalidLoginRes.status}: ${JSON.stringify(invalidLoginData)}`);
    }

  } catch (error) {
    console.error('\n❌ Verification tests failed:', error.message);
    process.exitCode = 1;
  } finally {
    // 8. Restore the original embedding
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
