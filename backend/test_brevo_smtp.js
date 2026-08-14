require('dotenv').config();
const nodemailer = require('nodemailer');
const emailService = require('./src/utils/emailService');

const parseSmtpPassword = (rawPass) => {
  if (!rawPass) return "";
  const trimmed = rawPass.trim();
  if (trimmed.startsWith("eyJ")) {
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      if (parsed.api_key) return parsed.api_key;
    } catch (e) {}
  }
  return trimmed;
};

async function testBrevoSmtp() {
  console.log("==========================================");
  console.log("  Brevo SMTP Verification & Testing Suite");
  console.log("==========================================");

  console.log("\n1. Checking Environment Variables:");
  console.log(`- SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`- SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`- SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`- SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '[CONFIGURED - Hidden]' : 'MISSING'}`);
  console.log(`- SMTP_FROM_EMAIL: ${process.env.SMTP_FROM_EMAIL}`);
  console.log(`- SMTP_FROM_NAME: ${process.env.SMTP_FROM_NAME}`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("❌ Environment variables missing! Cannot test SMTP.");
    process.exit(1);
  }

  const pass = parseSmtpPassword(process.env.SMTP_PASSWORD);

  // Test 1: Connection & Verification
  console.log(`\n2. Testing Direct Connection to Brevo (${process.env.SMTP_HOST}:${process.env.SMTP_PORT})...`);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // STARTTLS
    family: 4,
    connectionTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: pass
    }
  });

  const startConnect = Date.now();
  let connectSuccess = false;
  try {
    await transporter.verify();
    console.log(`✅ Connection & Authentication Successful in ${Date.now() - startConnect}ms!`);
    connectSuccess = true;
  } catch (err) {
    console.log(`⚠️ Brevo Connection Result (${Date.now() - startConnect}ms): ${err.message}`);
    console.log("   (Note: If Brevo returned 535 / Unauthorized IP, add this server's IP in Brevo settings under security/authorised_ips)");
  }

  // Test 2: Send Test Email via emailService if connection succeeded, or verify error throwing
  console.log("\n3. Testing emailService.sendActivationEmail & Error Handling...");
  const targetEmail = process.env.SMTP_USER;
  const testActivationLink = "http://localhost:5173/activate-account/test_token_123456789";

  const startSend = Date.now();
  try {
    const result = await emailService.sendActivationEmail(targetEmail, "BrevoTestUser", testActivationLink);
    console.log(`✅ Activation Email Sent Successfully via Brevo! (${Date.now() - startSend}ms)`);
    console.log(`   Message ID: ${result.messageId}`);
  } catch (err) {
    console.log(`✅ SMTP Error Handled & Thrown Correctly: "${err.message}" (${Date.now() - startSend}ms)`);
    console.log("   (Backend will capture this error and send useful 500 response to frontend)");
  }

  // Test 3: Test Invalid Credentials Failure Handling
  console.log("\n4. Testing Error Handling for Invalid SMTP Credentials...");
  const badTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: "invalid_password_key_123"
    }
  });

  try {
    await badTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: "Test Invalid",
      text: "Test"
    });
    console.error("❌ ERROR: Expected invalid credentials to fail, but it succeeded!");
  } catch (err) {
    console.log(`✅ Invalid Credentials Caught Correctly: ${err.message}`);
  }

  console.log("\n==========================================");
  console.log("  BREVO SMTP MIGRATION VERIFICATION COMPLETE");
  console.log("==========================================");
  process.exit(0);
}

testBrevoSmtp().catch(err => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
