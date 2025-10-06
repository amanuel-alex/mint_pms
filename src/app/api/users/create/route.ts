import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fullName, email, role, assignedProjects } = await req.json();

    // Basic server-side validation
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;
    const digitsOnly = /^\d+$/;

    if (!fullName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!nameRegex.test(fullName)) {
      return NextResponse.json(
        { error: "Name must contain letters and spaces only" },
        { status: 400 }
      );
    }

    if (digitsOnly.test(email) || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Generate secure activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with pending status (no password set)
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        role,
        status: "PENDING_ACTIVATION",
        activationToken,
        activationTokenExpires: expiresAt,
        createdBy: currentUser.id,
        // password is not set - will be null until activation
      },
    });

    // Create activation URL
    const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/activate-account?token=${activationToken}`;

    // Log the activation URL for debugging
    console.log("[DEBUG] Activation URL:", activationUrl);
    console.log("[DEBUG] Attempting to send activation email to:", email);

    // Send activation email
    const emailTemplate = createActivationEmailTemplate(fullName, activationUrl, role);
    const emailResult = await sendEmail({
      to: email,
      subject: "Welcome to Project Management System - Activate Your Account",
      html: emailTemplate,
    });
    console.log("[DEBUG] Email send result:", emailResult);

    if (!emailResult.success) {
      console.error("[ERROR] Email sending failed:", emailResult.error);
      // Delete the user if email fails
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "Failed to send activation email. Please check your email configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User created successfully. Activation email sent.",
      userId: user.id,
      activationUrl // Return the activation URL for debugging
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

function createActivationEmailTemplate(fullName: string, activationUrl: string, role: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activate Your Account</title>
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
        
        .activation-button {
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
        
        .activation-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(8, 118, 132, 0.3);
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
          
          .activation-button {
            padding: 14px 24px;
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">Project Management System</div>
          <div class="header-subtitle">Secure & Efficient Project Management</div>
        </div>
        
        <div class="content">
          <h1 class="title">🎉 Welcome to the Team!</h1>
          
          <p class="message">
            Hello ${fullName}! You've been invited to join our Project Management System as a <strong>${role.replace('_', ' ')}</strong>.
            To get started, please activate your account by setting up your password.
          </p>
          
          <div style="text-align: center;">
            <a href="${activationUrl}" class="activation-button">
              🚀 Activate My Account
            </a>
          </div>
          
          <div class="expiry-notice">
            <p class="expiry-text">⏰ This activation link will expire in 24 hours for security reasons</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="footer-text">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
          <p class="footer-text">
            This email was sent to you because an account was created for you in our system.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
} 