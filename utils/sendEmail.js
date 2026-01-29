const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Strip HTML tags for the text version
  const textMessage = options.message.replace(/<[^>]*>?/gm, '');

  // Send email
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, 
    to: options.email,
    subject: options.subject,
    text: textMessage,
    html: options.message,
    attachments: options.attachments || []
  };

  console.log(`📧 Sending email to: ${options.email}...`);

  try {
    const info = await transporter.sendMail(message);
    console.log(`✅ Email accepted by SMTP Server:
      MessageId: ${info.messageId}
      Accepted: ${info.accepted}
      Rejected: ${info.rejected}
      Response: ${info.response}`);
  } catch (error) {
    console.error(`❌ Email send failed: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;