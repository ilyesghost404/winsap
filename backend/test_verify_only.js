require('dotenv').config();
const nodemailer = require('nodemailer');

async function testVerify() {
  console.log("--- Testing ONLY transporter.verify() ---");
  console.log('SMTP host:', process.env.SMTP_HOST);
  console.log('SMTP port:', process.env.SMTP_PORT);
  console.log('SMTP user:', process.env.SMTP_USER);
  console.log('SMTP password configured:', Boolean(process.env.SMTP_PASSWORD));
  console.log('SMTP password length:', process.env.SMTP_PASSWORD?.length);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT || '587'),
    secure: false,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ AUTH SUCCESS: Brevo SMTP connection verified successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ AUTH FAILED:", err.message);
    process.exit(1);
  }
}

testVerify();
