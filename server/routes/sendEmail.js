// routes/emailRoute.js
const express = require("express");
const router = express.Router();
const sendMail = require("../utils/mailer");

router.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const htmlContent = `
    <h2>Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject || "No subject"}</p>
    <p><strong>Message:</strong><br/>${message}</p>
  `;

  try {
    await sendMail(process.env.ADMIN_RECEIVER, subject || "New Contact Message", htmlContent);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
