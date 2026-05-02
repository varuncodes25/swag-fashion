const nodemailer = require("nodemailer");
require("dotenv").config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

let warnedRenderWithoutBrevo = false;

function brevoApiKeyReady() {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

/** Sender must be verified in Brevo (Senders & IP → Domains / single sender). */
function getBrevoSenderEmail() {
  return (
    process.env.MAIL_FROM?.trim() ||
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    ""
  );
}

/**
 * Brevo Transactional Email over HTTPS (port 443) — works on Render free tier
 * where SMTP 587/465 is blocked.
 * @see https://developers.brevo.com/reference/sendtransacemail
 */
async function sendViaBrevoApi(toEmail, subject, htmlContent, textContent) {
  const apiKey = process.env.BREVO_API_KEY.trim();
  const fromEmail = getBrevoSenderEmail();
  if (!fromEmail) {
    const err = new Error(
      "Brevo API: set MAIL_FROM or BREVO_SENDER_EMAIL (or GMAIL_USER) to a Brevo-verified sender address.",
    );
    err.code = "BREVO_SENDER_MISSING";
    throw err;
  }

  const fromName = process.env.MAIL_FROM_NAME || "Swag Fashion";

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail }],
      subject,
      htmlContent,
      textContent: textContent || undefined,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof body.message === "string"
        ? body.message
        : JSON.stringify(body) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.code = "BREVO_API_ERROR";
    err.status = res.status;
    throw err;
  }

  console.log("Email sent (brevo_api):", body.messageId, "→", toEmail);
  return { messageId: body.messageId, response: body };
}

function getGmailAuth() {
  const user = process.env.GMAIL_USER?.trim() || "";
  let pass = process.env.GMAIL_PASS?.trim() || "";
  if (pass) {
    pass = pass.replace(/\s+/g, "");
  }
  return { user, pass };
}

function gmailKeysPresent() {
  const { user, pass } = getGmailAuth();
  return Boolean(user && pass);
}

function isConfigured() {
  return brevoApiKeyReady() || gmailKeysPresent();
}

function getFromAddress() {
  const explicit = process.env.MAIL_FROM?.trim();
  if (explicit) return explicit;
  return process.env.GMAIL_USER?.trim() || "noreply@example.com";
}

function createTransporter() {
  const { user, pass } = getGmailAuth();

  if (!user || !pass) {
    return null;
  }

  if (pass.length !== 16) {
    console.warn(
      "⚠️ GMAIL_PASS length is not 16. Google App Passwords are 16 characters: https://myaccount.google.com/apppasswords",
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

/**
 * 1) Brevo HTTPS API if BREVO_API_KEY (Render-safe)
 * 2) Else Gmail SMTP if GMAIL_USER + GMAIL_PASS (local / paid hosts)
 */
const sendMail = async (toEmail, subject, htmlContent) => {
  const textContent = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");

  if (
    process.env.RENDER === "true" &&
    gmailKeysPresent() &&
    !brevoApiKeyReady() &&
    !warnedRenderWithoutBrevo
  ) {
    warnedRenderWithoutBrevo = true;
    console.error(
      "[mailer] Render: set BREVO_API_KEY + MAIL_FROM (Brevo-verified). " +
        "Free tier blocks Gmail SMTP → ETIMEDOUT until API mail is configured.",
    );
  }

  if (brevoApiKeyReady()) {
    try {
      return await sendViaBrevoApi(
        toEmail,
        subject,
        htmlContent,
        textContent,
      );
    } catch (apiErr) {
      if (gmailKeysPresent()) {
        console.warn(
          "Brevo API failed, falling back to Gmail SMTP:",
          apiErr.message,
        );
      } else {
        console.error("Brevo API send failed:", apiErr.message);
        throw apiErr;
      }
    }
  }

  const transporter = createTransporter();
  if (!transporter) {
    const err = new Error(
      "Mail not configured. Set BREVO_API_KEY (+ MAIL_FROM verified in Brevo) for Render, " +
        "or GMAIL_USER + GMAIL_PASS for Gmail SMTP.",
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const fromAddr = getFromAddress();
  const fromName = process.env.MAIL_FROM_NAME || "Swag Fashion";

  const mailOptions = {
    from: `"${fromName}" <${fromAddr}>`,
    to: toEmail,
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    if (process.env.SMTP_VERIFY === "true") {
      await transporter.verify();
      console.log("SMTP verify OK (gmail)");
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent (gmail_smtp):", info.messageId, "→", toEmail);
    return info;
  } catch (error) {
    console.error("sendMail failed (gmail_smtp):", error.code, error.message);

    if (error.code === "EAUTH") {
      console.error(
        "Gmail EAUTH: use 16-char App Password with 2-Step ON, or use BREVO_API_KEY on Render.",
      );
    }
    if (["ESOCKET", "ETIMEDOUT", "ECONNRESET"].includes(error.code)) {
      console.error(
        "SMTP connection issue (often blocked on Render free). Prefer BREVO_API_KEY.",
      );
    }

    throw error;
  }
};

const testConnection = async () => {
  if (brevoApiKeyReady()) {
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": process.env.BREVO_API_KEY.trim() },
      });
      if (res.ok) {
        console.log("Brevo API key OK");
        return true;
      }
      console.error("Brevo account check failed:", res.status);
      return false;
    } catch (e) {
      console.error("Brevo API check error:", e.message);
      return false;
    }
  }

  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.verify();
    console.log("Gmail SMTP connection ready");
    return true;
  } catch (error) {
    console.error("Gmail SMTP verify failed:", error.message);
    return false;
  }
};

sendMail.isConfigured = isConfigured;
sendMail.testConnection = testConnection;

module.exports = sendMail;
