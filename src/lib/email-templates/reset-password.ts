import crypto from "crypto";

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const createResetPasswordEmailTemplate = (
  name: string,
  resetUrl: string,
  senderEmail: string = "support@projectmanagement.com",
  logoUrl: string = "/logo.png"
) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request - Project Management System</title>
          <meta name="sender-info" content="Project Management System <${senderEmail}>">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
              background: linear-gradient(135deg, #087684 0%, #065d69 100%);
              padding: 40px 30px;
              text-align: center;
            }
            
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #ffffff;
              margin-bottom: 10px;
            }
            
            .header-subtitle {
              color: #e0e0e0;
              font-size: 16px;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 20px;
              text-align: center;
            }
            
            .message {
              font-size: 16px;
              color: #4a5568;
              margin-bottom: 30px;
              text-align: center;
              line-height: 1.7;
            }
            
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #087684 0%, #065d69 100%);
              color: #fff !important;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px rgba(8, 118, 132, 0.2);
            }
            
            .reset-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(8, 118, 132, 0.3);
            }
            
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 20px;
              margin: 30px 0;
            }
            
            .warning-title {
              font-weight: 600;
              color: #856404;
              margin-bottom: 10px;
              font-size: 16px;
            }
            
            .warning-text {
              color: #856404;
              font-size: 14px;
              line-height: 1.6;
            }
            
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            
            .footer-text {
              color: #6c757d;
              font-size: 14px;
              margin-bottom: 15px;
            }
            
            .social-links {
              margin-top: 20px;
            }
            
            .social-link {
              display: inline-block;
              margin: 0 10px;
              color: #087684;
              text-decoration: none;
              font-weight: 500;
            }
            
            .expiry-notice {
              background-color: #e8f5e8;
              border: 1px solid #c3e6c3;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            
            .expiry-text {
              color: #2d5a2d;
              font-size: 14px;
              font-weight: 500;
            }
            
            @media (max-width: 600px) {
              .email-container {
                margin: 10px;
                border-radius: 8px;
              }
              
              .header, .content, .footer {
                padding: 20px;
              }
              
              .title {
                font-size: 20px;
              }
              
              .reset-button {
                padding: 14px 24px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="${logoUrl}" alt="Company Logo" style="max-width: 150px; height: auto; margin-bottom: 15px;" />
              <div class="logo">Project Management System</div>
              <div class="header-subtitle">Secure & Efficient Project Management</div>
            </div>
            
            <div class="content">
              <h1 class="title">🔐 Password Reset Request</h1>
              
              <p class="message">
                Hello ${name}! We received a request to reset your password for your Project Management System account. 
                If this was you, please click the button below to create a new password.
              </p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">
                  🔑 Reset My Password
                </a>
              </div>
              
              <div class="expiry-notice">
                <p class="expiry-text">⏰ This link will expire in 1 hour for security reasons</p>
              </div>
              
              <div class="warning">
                <div class="warning-title">⚠️ Security Notice</div>
                <div class="warning-text">
                  If you didn't request this password reset, please ignore this email. 
                  Your account is secure and no action is required. 
                  If you have concerns, please contact our support team immediately.
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                This email was sent to you because a password reset was requested for your account.
              </p>
              <p class="footer-text">
                If you have any questions, please don't hesitate to contact our support team.
              </p>
              <div class="social-links">
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Privacy Policy</a>
                <a href="#" class="social-link">Terms of Service</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `; 