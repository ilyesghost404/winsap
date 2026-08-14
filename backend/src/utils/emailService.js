const nodemailer = require("nodemailer");

let transporter;

const parseSmtpPassword = (rawPass) => {
  if (!rawPass) return "";
  const trimmed = rawPass.trim();
  if (trimmed.startsWith("eyJ")) {
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      if (parsed.api_key) return parsed.api_key;
      if (parsed.password) return parsed.password;
      if (parsed.smtp_password) return parsed.smtp_password;
    } catch (e) {
      // Ignored if not base64 JSON
    }
  }
  return trimmed;
};

const initTransporter = () => {
  console.log('SMTP host:', process.env.SMTP_HOST);
  console.log('SMTP port:', process.env.SMTP_PORT);
  console.log('SMTP user:', process.env.SMTP_USER);
  console.log('SMTP password configured:', Boolean(process.env.SMTP_PASSWORD));

  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = parseSmtpPassword(process.env.SMTP_PASSWORD);

  if (host && user && pass) {
    const isSecure = port === 465;

    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: isSecure, // false for port 587 (STARTTLS)
      family: 4,        // Force IPv4 to prevent 2-3 minute dual-stack IPv6 DNS connection timeouts
      pool: true,       // Maintain persistent connection pool for instant email delivery
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 5000,    // 5s greeting timeout
      socketTimeout: 15000,     // 15s socket timeout
      auth: {
        user: user,
        pass: pass,
      },
    });

    transporter.verify((err) => {
      if (err) {
        console.error("⚠️ Brevo SMTP Transporter Warning:", err.message);
      } else {
        console.log(`✉️ Brevo SMTP Transporter initialized on ${host}:${port} (${user})`);
      }
    });
  } else {
    console.error("Brevo SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are not configured in .env");
  }
};

initTransporter();

const sendEmail = async (to, subject, htmlContent) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 📤 [Brevo Email] Sending email to: ${to}`);

  if (!transporter) {
    initTransporter();
  }

  if (!transporter) {
    const errorMsg = "Brevo SMTP service is not configured. Please check backend .env settings.";
    console.error(`[${new Date().toISOString()}] ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'hmidilyes4442@gmail.com';
  const fromName = process.env.SMTP_FROM_NAME || 'WinSAP';
  
  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlContent,
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] 📥 Brevo accepted message. ID: ${info.messageId} (${duration}ms)`);
    return info;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] ❌ Error sending email to ${to} via Brevo after ${duration}ms:`, error.message);
    throw error;
  }
};

// --- Templates ---

const sendNewLoginEmail = async (userEmail, username, browser, device, ip, time) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333;">New Login Detected</h2>
      <p>Hello ${username},</p>
      <p>We noticed a new login to your WinSAP account with the following details:</p>
      <ul>
        <li><strong>Time:</strong> ${new Date(time).toLocaleString()}</li>
        <li><strong>Device:</strong> ${device || 'Unknown'}</li>
        <li><strong>Browser:</strong> ${browser || 'Unknown'}</li>
        <li><strong>IP Address:</strong> ${ip}</li>
      </ul>
      <p>If this was you, you can safely ignore this email.</p>
      <p style="color: #d9534f; font-weight: bold;">If you did not authorize this login, please change your password immediately and contact support.</p>
    </div>
  `;
  return sendEmail(userEmail, "Security Alert: New Login Detected", html);
};

const sendPasswordResetEmail = async (userEmail, username, resetLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello ${username},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
  `;
  return sendEmail(userEmail, "Reset Your Password", html);
};

const sendPasswordChangedEmail = async (userEmail, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333;">Password Changed Successfully</h2>
      <p>Hello ${username},</p>
      <p>Your password was just changed successfully.</p>
      <p>If you did not perform this action, please contact your administrator immediately.</p>
    </div>
  `;
  return sendEmail(userEmail, "Password Changed", html);
};

const sendAccountLockedEmail = async (userEmail, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #d9534f;">Account Locked</h2>
      <p>Hello ${username},</p>
      <p>Your account has been temporarily locked for 15 minutes due to multiple failed login attempts.</p>
      <p>If you forgot your password, please use the "Forgot Password" feature after the lockout period expires.</p>
    </div>
  `;
  return sendEmail(userEmail, "Security Alert: Account Locked", html);
};

const sendVerificationEmail = async (userEmail, username, verificationLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #333;">Welcome to WinSAP</h2>
      <p>Hello ${username},</p>
      <p>An account has been created for you. Please verify your email address to activate your account and set your password:</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0;">Verify Email & Activate Account</a>
      <p>This link is valid for 24 hours.</p>
    </div>
  `;
  return sendEmail(userEmail, "Activate Your Account", html);
};

const sendActivationEmail = async (userEmail, username, activationLink) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">WinSAP</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 32px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 600;">Welcome, ${username}!</h2>
          
          <p style="font-size: 16px; line-height: 24px; margin-bottom: 24px;">
            An account has been created for you by the administrator. To get started, please activate your account and set up your secure password.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationLink}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
              Activate Your Account
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 20px; margin-bottom: 8px;">
            <strong>Note:</strong> This activation link will expire in exactly 24 hours for security reasons.
          </p>
          
          <p style="font-size: 14px; color: #64748b; line-height: 20px;">
            If the button doesn't work, you can copy and paste the following link into your browser:<br>
            <a href="${activationLink}" style="color: #2563eb; word-break: break-all;">${activationLink}</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            Need help? Contact your IT administrator or reply to this email.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} WinSAP. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(userEmail, "Activate Your WinSAP Account", html);
};

const sendOtpEmail = async (userEmail, username, otpCode, expiryMinutes = 10) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">WinSAP</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 32px; text-align: center;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
          
          <p style="font-size: 16px; line-height: 24px; color: #64748b; margin-bottom: 24px; text-align: left;">
            Hello ${username},<br><br>
            We received a request to reset your password for your WinSAP account. Please use the verification code below to verify your identity and set a new password:
          </p>
          
          <!-- OTP Box -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px dashed #cbd5e1;">
            <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; margin-bottom: 8px;">Verification Code</span>
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 800; color: #2563eb; letter-spacing: 6px;">${otpCode}</span>
          </div>
          
          <p style="font-size: 14px; color: #d9534f; font-weight: 600; line-height: 20px; margin-bottom: 24px;">
            ⚠️ This verification code is valid for ${expiryMinutes} minutes. For security reasons, do not share this code with anyone.
          </p>
          
          <p style="font-size: 13px; color: #94a3b8; line-height: 20px; text-align: left; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">
            Need help? Contact your administrator.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} WinSAP. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(userEmail, "WinSAP Password Reset Code", html);
};

const sendLeaveApprovalEmail = async (userEmail, username, leaveType, startDate, endDate, daysCount) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">WinSAP</h1>
          <p style="color: #e6fffa; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Leave Request Approved</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #065f46; margin-top: 0; font-size: 20px;">Great news, ${username}!</h2>
          <p style="font-size: 15px; line-height: 22px; color: #475569;">
            Your request for <strong>${leaveType}</strong> has been officially approved by management.
          </p>
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 24px 0;">
            <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Type:</strong> ${leaveType}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Start Date:</strong> ${startDate}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>End Date:</strong> ${endDate}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #166534;"><strong>Chargeable Working Days:</strong> ${daysCount} day(s)</p>
          </div>
          <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            This is an automated notification based on your notification settings in WinSAP.
          </p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(userEmail, `Leave Request Approved: ${leaveType}`, html);
};

const sendLeaveRejectionEmail = async (userEmail, username, leaveType, startDate, endDate, reason = '') => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #f43f5e 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">WinSAP</h1>
          <p style="color: #ffe4e6; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Leave Request Status Update</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 20px;">Hello ${username},</h2>
          <p style="font-size: 15px; line-height: 22px; color: #475569;">
            Your request for <strong>${leaveType}</strong> (${startDate} to ${endDate}) was not approved by management at this time.
          </p>
          ${reason ? `<div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 16px; margin: 20px 0; color: #9f1239; font-size: 14px;"><strong>Reason:</strong> ${reason}</div>` : ''}
          <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you have questions, please reach out to your manager or HR team.
          </p>
        </div>
      </div>
    </div>
  `;
  return sendEmail(userEmail, `Leave Request Status Update: ${leaveType}`, html);
};

const sendHolidayReminderEmail = async (userEmail, username, holidayName, holidayDate) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">WinSAP</h1>
          <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Upcoming Holiday Reminder</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #075985; margin-top: 0; font-size: 20px;">Hello ${username},</h2>
          <p style="font-size: 15px; line-height: 22px; color: #475569;">
            This is a friendly reminder that an official non-working company holiday is coming up:
          </p>
          <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 20px; font-weight: 800; color: #0369a1;">${holidayName}</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; font-weight: 600; color: #0284c7;">📅 ${holidayDate}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  return sendEmail(userEmail, `Upcoming Holiday Reminder: ${holidayName}`, html);
};

const sendAttendanceDigestEmail = async (userEmail, username, date, stats = {}) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 0; margin: 0; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">WinSAP</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Daily Attendance Digest</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #3730a3; margin-top: 0; font-size: 20px;">Daily Summary (${date})</h2>
          <p style="font-size: 15px; color: #475569;">Hello ${username}, here is your daily attendance summary:</p>
          <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 14px; color: #312e81;"><strong>Status:</strong> ${stats.status || 'Check-in recorded'}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #312e81;"><strong>Present Employees:</strong> ${stats.presentCount || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  return sendEmail(userEmail, `Daily Attendance Digest - ${date}`, html);
};

module.exports = {
  sendNewLoginEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendAccountLockedEmail,
  sendVerificationEmail,
  sendActivationEmail,
  sendOtpEmail,
  sendLeaveApprovalEmail,
  sendLeaveRejectionEmail,
  sendHolidayReminderEmail,
  sendAttendanceDigestEmail
};

