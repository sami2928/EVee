const nodemailer = require("nodemailer");
const generateOTP = () => {
  let otp = "";
  for (let i = 0; i <= 3; i++) {
    const randVal = Math.round(Math.random() * 9);
    otp += randVal;
  }
  return otp;
};
const mailTransport = () => {
  return nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secure: false,
    port: 587,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    debug: false,
    logger: false,
  });
};

const verificationEmailTemplate = (userName, OTP) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            max-width: 150px;
        }
        .message {
            margin-bottom: 20px;
        }
        .otp {
            font-size: 24px;
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f2f2f2;
            border-radius: 5px;
        }
        .note {
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://yourdomain.com/logo.png" alt="Logo">
        </div>
        <div class="message">
            <p>Hello ${userName},</p>
            <p>Thank you for signing up with Comsats_EVee! To complete your registration, please use the following OTP:</p>
        </div>
        <div class="otp">
            ${OTP}
        </div>
        <div class="note">
            <p>This OTP is valid for a single use and will expire after 60 mins. Please do not share this OTP with anyone for security reasons.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Comsats_EVee</p>
        </div>
    </div>
</body>
</html>
`;
};

const verifiedEmailTemplate = () => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo img {
                max-width: 150px;
            }
            .message {
                margin-bottom: 20px;
            }
            .otp {
                font-size: 24px;
                text-align: center;
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f2f2f2;
                border-radius: 5px;
            }
            .note {
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="https://yourdomain.com/logo.png" alt="Logo">
            </div>
            <div class="message">
                <p>Hello,</p>
                <p>Your email has been successfully verified!</p>
            </div>
            <div class="note">
                <p>You can now access all the features of our platform.</p>
                <p>Thank you for connecting with us.</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>Comsats_EVee</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generatePasswordResetTemplate = (resetLink) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo img {
                max-width: 150px;
            }
            .message {
                margin-bottom: 20px;
            }
            .reset-link {
                text-align: center;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="https://yourdomain.com/logo.png" alt="Logo">
            </div>
            <div class="message">
                <p>Hello,</p>
                <p>We received a request to reset your password. If you did not make this request, you can ignore this email.</p>
                <p>To reset your password, click the link below:</p>
            </div>
            <div class="reset-link">
                <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <div class="note">
                <p>The link is valid for a limited time only. If you're having trouble, copy and paste the following URL into your browser:</p>
                <p>${resetLink}</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>Your Company Name</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const successfullyResetPasswordEmailTemplate = () => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successfully</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo img {
                max-width: 150px;
            }
            .message {
                margin-bottom: 20px;
            }
            .note {
                margin-bottom: 20px;
            }
            .footer {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                <img src="https://yourdomain.com/logo.png" alt="Logo">
            </div>
            <div class="message">
                <p>Hello,</p>
                <p>Your password has been successfully reset.</p>
                <p>If you did not initiate this action, please contact us immediately.</p>
            </div>
            <div class="note">
                <p>This is a system-generated email. Please do not reply to this email.</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>Your Company Name</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
  generateOTP,
  mailTransport,
  verificationEmailTemplate,
  verifiedEmailTemplate,
  generatePasswordResetTemplate,
  successfullyResetPasswordEmailTemplate,
};
