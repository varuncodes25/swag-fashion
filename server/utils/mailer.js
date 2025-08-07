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
      from: `"Swag fashion" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""), // Remove HTML tags for plain text
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
  //new email
  
};


module.exports = sendMail;
