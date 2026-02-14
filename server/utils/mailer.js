// filename: sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

// Gmail transporter setup with TLS fix
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Use App Password
  },
  tls: {
    rejectUnauthorized: false, // ✅ IMPORTANT: This fixes self-signed certificate error
  },
  // Connection timeout settings
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000,     // 60 seconds
});

// Send mail function
const sendMail = async (toEmail, subject, htmlContent) => {
  try {
    // Verify connection first
    await transporter.verify();
    console.log("✅ SMTP connection verified");
    
    const info = await transporter.sendMail({
      from: `"Swag Fashion" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""), // Plain text version
      html: htmlContent,
    });

    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 To:", toEmail);
    return info;
    
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    
    // Specific error handling
    if (error.code === 'EAUTH') {
      console.error("❌ Authentication failed - Check your GMAIL_USER and GMAIL_PASS");
      console.error("💡 Make sure you're using App Password, not regular Gmail password");
    }
    
    if (error.code === 'ESOCKET') {
      console.error("❌ Connection error - Adding more TLS options...");
      
      // Retry with different TLS options
      try {
        console.log("🔄 Retrying with different TLS settings...");
        
        const backupTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3' // Add cipher option
          },
          secure: false, // Try with secure false
          port: 587,     // Explicit port
        });
        
        const info = await backupTransporter.sendMail({
          from: `"Swag Fashion" <${process.env.GMAIL_USER}>`,
          to: toEmail,
          subject: subject,
          html: htmlContent,
        });
        
        console.log("✅ Email sent on retry!");
        return info;
        
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError.message);
      }
    }
    
    throw error; // Re-throw so controller can handle it
  }
};

module.exports = sendMail;