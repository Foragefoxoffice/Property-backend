/**
 * Email Template Wrapper
 * Provides a consistent, professional, and friendly look for all system emails.
 */

const getEmailTemplate = (title, content, footerText = null) => {
  const brandColor = '#41398B';
  const backgroundColor = '#f0f2f5';
  const textColor = '#333333';
  const year = new Date().getFullYear();
  const companyName = process.env.FROM_NAME || 'Property Management';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: ${backgroundColor};
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            color: ${textColor};
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: ${brandColor};
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .content h2 {
            color: ${brandColor};
            margin-top: 0;
            font-size: 20px;
        }
        .content p {
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid ${brandColor};
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .footer {
            padding: 25px 20px;
            text-align: center;
            background-color: #f8f9fa;
            border-top: 1px solid #eeeeee;
        }
        .footer p {
            margin: 0;
            color: #777777;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${brandColor};
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 10px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                width: 100%;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${companyName}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${year} ${companyName}. All rights reserved.</p>
            ${footerText ? `<p style="margin-top: 10px;">${footerText}</p>` : ''}
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Specifically for OTP/Verification Codes
 */
const getOTPTemplate = (otp, title = "Password Reset OTP") => {
  const content = `
    <h2>Hello,</h2>
    <p>We received a request to access your account through a one-time password (OTP).</p>
    <div class="info-box" style="text-align: center;">
        <p style="margin-bottom: 10px; font-size: 16px; color: #666;">Your Verification Code</p>
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 5px; color: #41398B;">${otp}</span>
    </div>
    <p>This code is <strong>valid for 30 minutes</strong>. If you did not request this code, please ignore this email or contact support if you have concerns.</p>
    <p>For your security, never share this code with anyone.</p>
    <p>Best regards,<br><a href="${process.env.CLIENT_URL || '#'}">${process.env.FROM_NAME || 'Property Management'}</a> Team</p>
  `;
  return getEmailTemplate(title, content);
};

/**
 * Specifically for Welcome / Credentials
 */
const getCredentialsTemplate = (name, email, password, title = "Welcome to our Platform") => {
  const content = `
    <h2>Welcome ${name}!</h2>
    <p>Your account has been created successfully. You can now log in using the credentials below:</p>
    <div class="info-box">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px;">${password}</span></p>
    </div>
    <p>For security reasons, we recommend changing your password after your first login.</p>
    <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.CLIENT_URL || '#'}" class="button">Log In to Your Account</a>
    </div>
    <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
    <p>Best regards,<br>The ${process.env.FROM_NAME || 'Property Management'} Team</p>
  `;
  return getEmailTemplate(title, content);
};

/**
 * Specifically for Notifications/Enquiries
 */
const getNotificationTemplate = (title, detailsHtml, footerText = null) => {
  const content = `
    <h2>${title}</h2>
    <p>A new enquiry has been received with the following details:</p>
    <div class="info-box">
        ${detailsHtml}
    </div>
    <p>Please log in to the admin panel to view full details and respond.</p>
  `;
  return getEmailTemplate(title, content, footerText);
};

module.exports = {
  getEmailTemplate,
  getOTPTemplate,
  getCredentialsTemplate,
  getNotificationTemplate
};
