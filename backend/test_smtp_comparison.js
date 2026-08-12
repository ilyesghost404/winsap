const nodemailer = require('nodemailer');

async function testPort465() {
  console.log('--- Testing Port 465 (Direct SSL/TLS + IPv4 + Pool) ---');
  const start = Date.now();

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Direct SSL/TLS
    family: 4,    // Force IPv4
    pool: true,   // Persistent connection pool
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
    auth: {
      user: 'hmidilyes607@gmail.com',
      pass: 'qali rbyc gaee edzi'
    }
  });

  try {
    const verified = await transporter.verify();
    console.log(`✓ Port 465 Transporter Verified in ${Date.now() - start} ms! Result:`, verified);

    // Send a test mail to measure exact delivery time
    const sendStart = Date.now();
    console.log(`[${new Date().toISOString()}] Sending email via Port 465 pool...`);
    
    const info = await transporter.sendMail({
      from: '"WinSAP" <hmidilyes607@gmail.com>',
      to: 'hmidilyes607@gmail.com',
      subject: 'Speed Test Activation Email',
      html: '<h3>Speed Test Email</h3><p>Sent immediately via optimized SMTP pool.</p>'
    });

    const sendDuration = Date.now() - sendStart;
    console.log(`[${new Date().toISOString()}] ✓ Email delivered in ${sendDuration} ms! Message ID: ${info.messageId}`);
    
    transporter.close();
    process.exit(0);
  } catch (err) {
    console.error(`✗ Port 465 Failed after ${Date.now() - start} ms:`, err.message);
    process.exit(1);
  }
}

testPort465();
