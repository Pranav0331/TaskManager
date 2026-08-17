import nodemailer from 'nodemailer';

/**
 * Creates and returns Nodemailer transporter for Gmail SMTP
 */
export const createTransporter = () => {
  const rawUser = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_APP_PASSWORD;

  if (!rawUser || !rawPass) {
    return null;
  }

  // Clean quotes and whitespace
  const user = rawUser.replace(/['"]/g, '').trim();
  const pass = rawPass.replace(/['"\s]/g, '').trim();

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevent self-signed cert issues on some networks
    },
  });
};

/**
 * Verify SMTP connection and log status
 */
export const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  const user = process.env.EMAIL_USER?.replace(/['"]/g, '').trim();

  if (!transporter || !user || user === 'your_email@gmail.com') {
    console.log('ℹ️  [SMTP] Gmail credentials not yet configured in backend/.env.');
    console.log('   (OTP codes will be logged to this terminal for local testing)');
    return false;
  }

  try {
    await transporter.verify();
    console.log(`✅ [SMTP] Gmail SMTP connected & verified successfully for ${user}`);
    return true;
  } catch (error) {
    console.error(`❌ [SMTP ERROR] Gmail SMTP connection failed for ${user}:`, error.message);
    if (error.code === 'EAUTH') {
      console.error('   👉 EAUTH Error: Check your Gmail App Password. Ensure 2-Step Verification is enabled in your Google Account and you are using a 16-character App Password (not your normal Gmail password).');
    }
    return false;
  }
};

/**
 * Send OTP Verification Email to User
 * @param {string} email - Recipient email address
 * @param {string} otp - 4-digit verification code
 */
export const sendOTPEmail = async (email, otp) => {
  const rawUser = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_APP_PASSWORD;
  const user = rawUser ? rawUser.replace(/['"]/g, '').trim() : '';
  const isPlaceholder = !user || user === 'your_email@gmail.com' || !rawPass || rawPass === 'your_gmail_app_password';

  console.log(`\n------------------------------------------------------`);
  console.log(`🔑 [TASKFLOW OTP GENERATED]:`);
  console.log(`   Email: ${email}`);
  console.log(`   Code:  [ ${otp} ]`);
  console.log(`   TTL:   1 minute`);
  console.log(`------------------------------------------------------`);

  // If credentials are missing or default placeholders
  if (isPlaceholder) {
    console.log(`⚠️  [EMAIL NOT SENT]: EMAIL_USER / EMAIL_APP_PASSWORD not configured in backend/.env`);
    console.log(`👉 To send real emails to your Gmail inbox, add to backend/.env:`);
    console.log(`   EMAIL_USER=your_real_email@gmail.com`);
    console.log(`   EMAIL_APP_PASSWORD=your_16_character_app_password`);
    console.log(`👉 In the meantime, use the code [ ${otp} ] in the UI to verify.`);
    console.log(`------------------------------------------------------\n`);
    return { success: true, mode: 'dev_terminal_logged', otp };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"TaskFlow" <${user}>`,
    to: email,
    subject: 'TaskFlow - Verify your email',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-height: 100vh; background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center" valign="top">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 36px 36px 24px; text-align: center; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                      <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 12px;">
                        ✓
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">TaskFlow</h1>
                      <p style="margin: 4px 0 0; font-size: 13px; color: #c7d2fe;">Empowering your productivity</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px 36px;">
                      <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #f8fafc; text-align: center;">Verify your email address</h2>
                      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                        Thank you for starting your registration with TaskFlow. Use the 4-digit verification code below to complete your account setup:
                      </p>

                      <!-- OTP Box -->
                      <div style="background-color: #1e1b4b; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #818cf8; font-family: monospace; display: inline-block; padding-left: 12px;">
                          ${otp}
                        </span>
                        <p style="margin: 10px 0 0; font-size: 12px; color: #a5b4fc; font-weight: 500;">
                          ⏱️ Code expires in <strong>1 minute</strong>
                        </p>
                      </div>

                      <!-- Security Notice -->
                      <div style="background-color: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 16px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #fbbf24;">
                          <strong>Security note:</strong> Never share this code with anyone. TaskFlow support will never ask for your verification code.
                        </p>
                      </div>

                      <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
                        If you did not request this verification code, please disregard this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 36px; background-color: #0b0f19; border-top: 1px solid #1e293b; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #475569;">
                        © ${new Date().getFullYear()} TaskFlow Inc. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    console.log(`📨 Connecting to Gmail SMTP to send OTP email to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL DELIVERED] Message ID: ${info.messageId} to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`\n❌ [EMAIL SENDING FAILED] Recipient: ${email}`);
    console.error(`   Error Message: ${error.message}`);
    if (error.code) console.error(`   Error Code:    ${error.code}`);
    if (error.response) console.error(`   SMTP Response: ${error.response}`);
    console.error(`   👉 Hint: Check your Gmail App Password in backend/.env. Generate a 16-character App Password at: https://myaccount.google.com/apppasswords`);
    console.log(`🔑 [FALLBACK TEST OTP CODE]: [ ${otp} ]\n`);

    // In development mode, allow the flow to proceed so the developer is not blocked
    if (process.env.NODE_ENV === 'development') {
      return { success: true, mode: 'dev_fallback_logged', error: error.message };
    }

    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export default sendOTPEmail;
