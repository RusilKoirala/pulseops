import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Beautiful email template wrapper
function emailTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PulseOps</title>
  <style>
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f6f8fa;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .email-card {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .email-body {
      padding: 32px 24px;
    }
    .email-body p {
      color: #475467;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .email-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
    }
    .email-footer {
      padding: 24px;
      text-align: center;
      background-color: #f6f8fa;
      border-top: 1px solid #e5e7eb;
    }
    .email-footer p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 50px;
      font-weight: 600;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .status-down {
      background-color: #fef2f2;
      color: #dc2626;
    }
    .status-up {
      background-color: #ecfdf5;
      color: #16a34a;
    }
    .status-verify {
      background-color: #eff6ff;
      color: #2563eb;
    }
    .monitor-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
    }
    .monitor-name {
      font-weight: 600;
      color: #111827;
      font-size: 18px;
      margin-bottom: 4px;
    }
    .monitor-url {
      color: #6b7280;
      font-size: 14px;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-card">
      ${content}
    </div>
  </div>
</body>
</html>
  `;
}

// sending verification emaill -->>
export async function sendVerificationEmail(email, token) {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = emailTemplate(`
    <div class="email-header">
      <h1>Verify your email</h1>
    </div>
    <div class="email-body">
      <span class="status-badge status-verify">Email Verification</span>
      <p>Thanks for signing up for PulseOps! Please verify your email address to get started.</p>
      <p>This link will expire in 24 hours.</p>
      <div style="text-align: center">
        <a href="${link}" class="email-button">Verify Email</a>
      </div>
      <p style="margin-top: 32px; font-size: 14px; color: #9ca3af;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${link}" style="color: #3b82f6; text-decoration: none;">${link}</a>
      </p>
    </div>
    <div class="email-footer">
      <p>Sent by PulseOps • <a href="${process.env.FRONTEND_URL}" style="color: #3b82f6; text-decoration: none;">Visit our website</a></p>
    </div>
  `);
  
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Verify your PulseOps email",
    html,
  });
}

// sending down alert --->>>
export async function sendDownAlert(email, monitorName, url) {
  const html = emailTemplate(`
    <div class="email-header">
      <h1>Monitor is Down!</h1>
    </div>
    <div class="email-body">
      <span class="status-badge status-down">DOWN</span>
      <p>Your monitor <strong>${monitorName}</strong> is not responding!</p>
      <div class="monitor-card">
        <div class="monitor-name">${monitorName}</div>
        <div class="monitor-url">${url}</div>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.FRONTEND_URL}" class="email-button">Check Dashboard</a>
      </div>
    </div>
    <div class="email-footer">
      <p>Sent by PulseOps • <a href="${process.env.FRONTEND_URL}" style="color: #3b82f6; text-decoration: none;">Visit our website</a></p>
    </div>
  `);
  
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `⚠️ ${monitorName} is DOWN`,
    html,
  });
}

// sending recovery alert ->>>>> 
export async function sendRecoveryAlert(email, monitorName, url) {
  const html = emailTemplate(`
    <div class="email-header">
      <h1>Monitor Recovered!</h1>
    </div>
    <div class="email-body">
      <span class="status-badge status-up">RECOVERED</span>
      <p>Great news! Your monitor <strong>${monitorName}</strong> is back up and running!</p>
      <div class="monitor-card">
        <div class="monitor-name">${monitorName}</div>
        <div class="monitor-url">${url}</div>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.FRONTEND_URL}" class="email-button">View Dashboard</a>
      </div>
    </div>
    <div class="email-footer">
      <p>Sent by PulseOps • <a href="${process.env.FRONTEND_URL}" style="color: #3b82f6; text-decoration: none;">Visit our website</a></p>
    </div>
  `);
  
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: `✅ ${monitorName} has recovered`,
    html,
  });
}
