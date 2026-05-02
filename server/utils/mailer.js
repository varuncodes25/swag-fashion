// utils/sendMail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Get Gmail credentials
function getGmailAuth() {
  const user = process.env.GMAIL_USER?.trim() || "";
  let pass = process.env.GMAIL_PASS?.trim() || "";
  if (pass) {
    pass = pass.replace(/\s+/g, ""); // Remove spaces from app password
  }
  return { user, pass };
}

// ✅ Check if configured
function isConfigured() {
  const { user, pass } = getGmailAuth();
  return Boolean(user && pass);
}

// ✅ Create Gmail transporter
function createTransporter() {
  const { user, pass } = getGmailAuth();
  
  if (!user || !pass) {
    console.error("❌ Gmail credentials missing. Set GMAIL_USER and GMAIL_PASS in .env");
    return null;
  }

  // Check if password length is 16 (App Password)
  if (pass.length !== 16) {
    console.warn(
      "⚠️ Warning: GMAIL_PASS length is not 16. " +
      "Google App Passwords are exactly 16 characters. " +
      "Get one from: https://myaccount.google.com/apppasswords"
    );
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
}

// ✅ Get from address
function getFromAddress() {
  const explicit = process.env.MAIL_FROM?.trim();
  if (explicit) return explicit;
  return process.env.GMAIL_USER?.trim() || "noreply@example.com";
}

// ✅ Send email function
const sendMail = async (toEmail, subject, htmlContent) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    const err = new Error(
      "Gmail not configured. Set GMAIL_USER and GMAIL_PASS in .env file.\n" +
      "Get App Password: https://myaccount.google.com/apppasswords"
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  // Create plain text version from HTML
  const textContent = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");

  const fromAddr = getFromAddress();
  const fromName = process.env.MAIL_FROM_NAME || "Swag Fashion";

  const mailOptions = {
    from: `"${fromName}" <${fromAddr}>`,
    to: toEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    // Verify connection first (optional)
    if (process.env.SMTP_VERIFY === "true") {
      await transporter.verify();
      console.log("✅ SMTP connection verified");
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${toEmail}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ sendMail failed:", error.code, error.message);
    
    if (error.code === "EAUTH") {
      console.error(
        "\n🔐 Gmail Authentication Failed!\n" +
        "1. Enable 2-Step Verification in your Google Account\n" +
        "2. Generate App Password: https://myaccount.google.com/apppasswords\n" +
        "3. Copy the 16-character password to .env as GMAIL_PASS\n" +
        "4. Make sure GMAIL_USER is your full email address\n"
      );
    }
    
    if (["ESOCKET", "ETIMEDOUT", "ECONNRESET"].includes(error.code)) {
      console.error(
        "⚠️ Network issue - Gmail SMTP may be blocked.\n" +
        "If on Render/Vercel, outbound SMTP ports might be blocked.\n" +
        "Consider using Brevo or Gmail API instead."
      );
    }
    
    throw error;
  }
};

// ✅ Test function
const testConnection = async () => {
  const transporter = createTransporter();
  if (!transporter) return false;
  
  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP connection ready");
    return true;
  } catch (error) {
    console.error("❌ Gmail SMTP connection failed:", error.message);
    return false;
  }
};

sendMail.isConfigured = isConfigured;
sendMail.testConnection = testConnection;

module.exports = sendMail;