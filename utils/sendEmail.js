const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter specifically for Gmail service
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Strip HTML tags for the text version
  const textMessage = options.message.replace(/<[^>]*>?/gm, '');

  // Send email
  const message = {
    from: process.env.SMTP_EMAIL, // Use plain email to avoid formatting flags
    to: options.email,
    subject: options.subject,
    text: textMessage,
    html: options.message,
    attachments: options.attachments || []
  };

  console.log(`📧 Sending email to: ${options.email}...`);

  try {
    const info = await transporter.sendMail(message);
    console.log(`✅ Email accepted by Gmail:
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