const express = require("express");
const router = express.Router();
const sendMail = require("../utils/mailer");

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

router.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const adminTo =
    process.env.ADMIN_RECEIVER?.trim() || process.env.GMAIL_USER?.trim();
  if (!adminTo) {
    console.error(
      "send-email: Set ADMIN_RECEIVER (admin inbox) or GMAIL_USER in .env",
    );
    return res.status(503).json({
      error:
        "Mail not configured. Add ADMIN_RECEIVER and GMAIL_USER / GMAIL_PASS on the server.",
    });
  }

  if (!sendMail.isConfigured?.()) {
    return res.status(503).json({
      error:
        "Mail not configured. Set BREVO_USER + BREVO_SMTP_KEY or GMAIL_USER + GMAIL_PASS.",
    });
  }

  const htmlContent = `
    <h2>Contact form — Swag Fashion</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject || "No subject")}</p>
    <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  try {
    const subj = String(subject || "New contact")
      .replace(/[\r\n]+/g, " ")
      .slice(0, 120);
    await sendMail(adminTo, `[Contact] ${subj}`, htmlContent);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("send-email:", err.code, err.message);
    res.status(500).json({
      error: "Failed to send email. Check server logs and Gmail App Password.",
    });
  }
});

module.exports = router;
