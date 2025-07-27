// filename: sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Send mail function
const sendMail = async (toEmail, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"UniFashion" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

module.exports = sendMail;
