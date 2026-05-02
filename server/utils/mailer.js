const nodemailer = require("nodemailer");
require("dotenv").config();

/** auto | gmail | brevo — default auto = Gmail first if keys exist, else Brevo */
function mailProvider() {
  return (process.env.MAIL_PROVIDER || "auto").toLowerCase().trim();
}

function getBrevoAuth() {
  const user = process.env.BREVO_USER?.trim() || "";
  const pass = process.env.BREVO_SMTP_KEY?.trim() || "";
  return { user, pass };
}

function brevoKeysPresent() {
  const { user, pass } = getBrevoAuth();
  return Boolean(user && pass);
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

function createBrevoBundle() {
  const { user, pass } = getBrevoAuth();
  return {
    kind: "brevo",
    transport: nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: { user, pass },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    }),
  };
}

function createGmailBundle() {
  const { user, pass } = getGmailAuth();
  if (!user || !pass) {
    return null;
  }
  return {
    kind: "gmail",
    transport: nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    }),
  };
}

function createTransporter() {
  const mode = mailProvider();

  if (mode === "gmail") {
    return createGmailBundle();
  }

  if (mode === "brevo") {
    return brevoKeysPresent() ? createBrevoBundle() : null;
  }

  // auto: Gmail first (no MAIL_PROVIDER needed), else Brevo if configured
  if (gmailKeysPresent()) {
    return createGmailBundle();
  }
  if (brevoKeysPresent()) {
    return createBrevoBundle();
  }
  return null;
}

function getFromAddress(smtpKind) {
  const explicit = process.env.MAIL_FROM?.trim();
  if (explicit) {
    return explicit;
  }
  const gmail = process.env.GMAIL_USER?.trim();
  if (gmail) {
    return gmail;
  }
  if (smtpKind === "brevo") {
    return getBrevoAuth().user;
  }
  return gmail || "noreply@example.com";
}

function isConfigured() {
  const mode = mailProvider();
  if (mode === "gmail") {
    return gmailKeysPresent();
  }
  if (mode === "brevo") {
    return brevoKeysPresent();
  }
  return brevoKeysPresent() || gmailKeysPresent();
}

/**
 * Transactional mail: Brevo and/or Gmail via .env.
 *
 * MAIL_PROVIDER:
 *   - auto (default): Gmail if GMAIL_* set, else Brevo — no variable needed for Gmail-only
 *   - gmail: only GMAIL_USER + GMAIL_PASS (ignores Brevo keys)
 *   - brevo: only BREVO_USER + BREVO_SMTP_KEY
 *
 * Optional: MAIL_FROM=… (Brevo verified sender)
 */
const sendMail = async (toEmail, subject, htmlContent) => {
  const bundle = createTransporter();
  if (!bundle) {
    const err = new Error(
      "Mail not configured for MAIL_PROVIDER=" +
        mailProvider() +
        ". Set the matching SMTP vars in .env.",
    );
    err.code = "EMAIL_NOT_CONFIGURED";
    throw err;
  }

  const { kind, transport } = bundle;
  const fromAddr = getFromAddress(kind);

  const mailOptions = {
    from: `"Swag Fashion" <${fromAddr}>`,
    to: toEmail,
    subject,
    text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""),
    html: htmlContent,
  };

  try {
    if (process.env.SMTP_VERIFY === "true") {
      await transport.verify();
      console.log("SMTP verify OK (" + kind + ")");
    }

    const info = await transport.sendMail(mailOptions);
    console.log("Email sent (" + kind + "):", info.messageId, "→", toEmail);
    return info;
  } catch (error) {
    console.error("sendMail failed (" + kind + "):", error.code, error.message);
    if (error.code === "EAUTH" && kind === "gmail") {
      console.error(
        "Gmail EAUTH: use a 16-char App Password with 2-Step ON, or set MAIL_PROVIDER=brevo to use Brevo only.",
      );
    }
    if (error.code === "EAUTH" && kind === "brevo") {
      console.error(
        "Brevo EAUTH: check BREVO_USER and BREVO_SMTP_KEY in Brevo → SMTP & API.",
      );
    }

    if (
      kind === "gmail" &&
      (error.code === "ESOCKET" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNRESET")
    ) {
      try {
        const { user, pass } = getGmailAuth();
        const fallback = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
        const info = await fallback.sendMail(mailOptions);
        console.log("Email sent (gmail fallback 587):", info.messageId);
        return info;
      } catch (fallbackErr) {
        console.error("sendMail gmail fallback failed:", fallbackErr.message);
      }
    }

    throw error;
  }
};

sendMail.isConfigured = isConfigured;

module.exports = sendMail;
