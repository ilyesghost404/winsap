const nodemailer = require('nodemailer');
const dns = require('dns');

// Measure DNS lookup time
console.time('dns-lookup');
dns.lookup('smtp.gmail.com', (err, address, family) => {
  console.timeEnd('dns-lookup');
  console.log(`DNS Resolved smtp.gmail.com to: ${address} (IPv${family})`);
});

// Test 1: Standard transport (without family: 4)
const transporter1 = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'hmidilyes607@gmail.com',
    pass: 'qali rbyc gaee edzi'
  }
});

// Test 2: Optimized transport (with family: 4 and pool: true)
const transporter2 = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4, // Force IPv4
  pool: true, // Use connection pool
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 5000,
  socketTimeout: 15000,
  auth: {
    user: 'hmidilyes607@gmail.com',
    pass: 'qali rbyc gaee edzi'
  }
});

async function testConnection() {
  console.log('--- Testing Standard Transporter (Test 1) ---');
  const start1 = Date.now();
  try {
    await transporter1.verify();
    console.log(`✓ Test 1 Verified in ${Date.now() - start1} ms`);
  } catch (err) {
    console.log(`✗ Test 1 Failed after ${Date.now() - start1} ms:`, err.message);
  }

  console.log('\n--- Testing Optimized Transporter with family:4 & pool:true (Test 2) ---');
  const start2 = Date.now();
  try {
    await transporter2.verify();
    console.log(`✓ Test 2 Verified in ${Date.now() - start2} ms`);
  } catch (err) {
    console.log(`✗ Test 2 Failed after ${Date.now() - start2} ms:`, err.message);
  }
}

testConnection();
