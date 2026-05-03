const nodemailer = require("nodemailer");
require("dotenv").config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

function isRenderHost() {
  return process.env.RENDER === "true";
}

/** Paid Render / custom host: outbound SMTP allowed — set on Render env if Gmail SMTP works */
function allowGmailSmtpOnRender() {
  return process.env.ALLOW_GMAIL_SMTP_ON_RENDER === "true";
}

/** Brevo v3 transactional key (often starts with `xkeysib-`). NOT the SMTP password. */
function getBrevoApiKey() {
  return (
    process.env.BREVO_API_KEY?.trim() ||
    process.env.SENDINBLUE_API_KEY?.trim() ||
    ""
  );
}

function brevoApiKeyReady() {
  return Boolean(getBrevoApiKey());
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
  const apiKey = getBrevoApiKey();
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
    console.error("[mailer] Brevo API HTTP", res.status, body);
    const hint =
      res.status === 401
        ? " Wrong or SMTP password used as API key — use “Transactional” / v3 API key (xkeysib-…), Brevo → SMTP & API → API keys."
        : res.status === 400
          ? " Often: sender not verified — Brevo → Senders: MAIL_FROM must match a verified email/domain."
          : "";
    const msg =
      (typeof body.message === "string" ? body.message : null) ||
      (typeof body.code === "string" ? body.code : null) ||
      JSON.stringify(body) ||
      `HTTP ${res.status}`;
    const err = new Error(String(msg) + (hint ? " " + hint : ""));
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

/**
 * On Render (default): only Brevo API counts as configured — avoids ETIMEDOUT on blocked Gmail SMTP.
 * Set ALLOW_GMAIL_SMTP_ON_RENDER=true if your plan allows SMTP and you use Gmail only.
 */
function isConfigured() {
  if (isRenderHost() && !allowGmailSmtpOnRender()) {
    return brevoApiKeyReady();
  }
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
      "GMAIL_PASS length is not 16. Google App Passwords are 16 characters: https://myaccount.google.com/apppasswords",
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

function assertNotBlockedGmailSmtpOnRender() {
  if (
    isRenderHost() &&
    !allowGmailSmtpOnRender() &&
    gmailKeysPresent() &&
    !brevoApiKeyReady()
  ) {
    const err = new Error(
      "On Render add BREVO_API_KEY and MAIL_FROM (Brevo-verified). Gmail SMTP is blocked on the free web service.",
    );
    err.code = "RENDER_USE_BREVO_API";
    throw err;
  }
}

/**
 * 1) Brevo HTTPS API if BREVO_API_KEY (works on Render free)
 * 2) Else Gmail SMTP (local, or Render only if ALLOW_GMAIL_SMTP_ON_RENDER=true)
 */
const sendMail = async (toEmail, subject, htmlContent) => {
  const textContent = htmlContent.replace(/<\/?[^>]+(>|$)/g, "");

  if (brevoApiKeyReady()) {
    try {
      return await sendViaBrevoApi(
        toEmail,
        subject,
        htmlContent,
        textContent,
      );
    } catch (apiErr) {
      const canFallbackGmail =
        gmailKeysPresent() &&
        (!isRenderHost() || allowGmailSmtpOnRender());
      if (canFallbackGmail) {
        console.warn(
          "Brevo API failed, falling back to Gmail SMTP:",
          apiErr.message,
        );
      } else {
        if (isRenderHost() && gmailKeysPresent()) {
          console.error(
            "Brevo API failed on Render; Gmail SMTP fallback disabled (blocked). Fix Brevo key/sender.",
            apiErr.message,
          );
        }
        throw apiErr;
      }
    }
  }

  assertNotBlockedGmailSmtpOnRender();

  const transporter = createTransporter();
  if (!transporter) {
    const err = new Error(
      "Mail not configured. Render: BREVO_API_KEY + MAIL_FROM. Local: GMAIL_USER + GMAIL_PASS or Brevo.",
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
        "Gmail EAUTH: 16-char App Password + 2-Step, or use BREVO_API_KEY on Render.",
      );
    }
    if (["ESOCKET", "ETIMEDOUT", "ECONNRESET"].includes(error.code)) {
      console.error(
        "SMTP blocked or unreachable (Render free → use BREVO_API_KEY).",
      );
    }

    throw error;
  }
};

const testConnection = async () => {
  if (brevoApiKeyReady()) {
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": getBrevoApiKey() },
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

  if (isRenderHost() && !allowGmailSmtpOnRender()) {
    console.warn(
      "testConnection: on Render set BREVO_API_KEY (Gmail SMTP verify skipped).",
    );
    return false;
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

/** Safe booleans for debugging (no secrets). */
function getMailDebugInfo() {
  const from = getBrevoSenderEmail();
  return {
    onRender: isRenderHost(),
    allowGmailSmtpOnRender: allowGmailSmtpOnRender(),
    brevoApiKeySet: brevoApiKeyReady(),
    /** Must match a sender verified in Brevo (Senders & IP). */
    resolvedFromEmail: from || null,
    mailConfigured: isConfigured(),
  };
}

function logMailStartupHint() {
  if (!isRenderHost() || allowGmailSmtpOnRender()) return;
  if (!brevoApiKeyReady()) {
    console.error(
      "[mailer] Render: set BREVO_API_KEY (v3 key from Brevo → SMTP & API → API keys, not SMTP password).",
    );
    return;
  }
  if (!getBrevoSenderEmail()) {
    console.error(
      "[mailer] Render: set MAIL_FROM (or BREVO_SENDER_EMAIL) to the same email you verified in Brevo → Senders.",
    );
    return;
  }
  console.log("[mailer] Brevo HTTPS mail path ready for:", getBrevoSenderEmail());
}

sendMail.isConfigured = isConfigured;
sendMail.testConnection = testConnection;
sendMail.getMailDebugInfo = getMailDebugInfo;
sendMail.logMailStartupHint = logMailStartupHint;

module.exports = sendMail;
