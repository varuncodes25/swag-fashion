const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

/**
 * Gmail SMTP. Set GMAIL_USER + GMAIL_PASS (16-char App Password, 2FA on).
 *
 * Pehle yahan `transporter.verify()` har email se pehle chalta tha — bahut hosting /
 * firewall par verify fail ho jata hai aur mail "trigger hi nahi" hoti thi.
 * Debug ke liye: .env mein SMTP_VERIFY=true (optional).
 */
const sendMail = async (toEmail, subject, htmlContent) => {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_PASS?.trim();
  if (!user || !pass) {
    const err = new Error(
      "Gmail not configured: set GMAIL_USER and GMAIL_PASS (Google App Password).",
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const mailOptions = {
    from: `"Swag Fashion" <${user}>`,
    to: toEmail,
    subject,
    text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""),
    html: htmlContent,
  };

  try {
    if (process.env.SMTP_VERIFY === "true") {
      await transporter.verify();
      console.log("SMTP verify OK");
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId, "to:", toEmail);
    return info;
  } catch (error) {
    console.error("sendMail failed:", error.code, error.message);
    if (error.code === "EAUTH") {
      console.error(
        "Gmail auth failed — use an App Password (Google Account → Security → 2-Step → App passwords), not your normal login password.",
      );
    }

    // Fallback: explicit smtp.gmail.com (kabhi service:'gmail' verify ke bina theek chal jata hai)
    if (
      error.code === "ESOCKET" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNRESET"
    ) {
      try {
        const fallback = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
        const info = await fallback.sendMail(mailOptions);
        console.log("Email sent (fallback 587):", info.messageId);
        return info;
      } catch (fallbackErr) {
        console.error("sendMail fallback failed:", fallbackErr.message);
      }
    }

    throw error;
  }
};

module.exports = sendMail;
