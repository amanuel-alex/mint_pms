import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/serverAuth";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "PROJECT_MANAGER") {
      return NextResponse.json(
        { error: "Only project managers can create team members." },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { fullName, email } = body;
    if (!fullName || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    // Validation
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*$/;
    const digitsOnly = /^\d+$/;
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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }
    // Generate secure activation token
    const activationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // Create the team member (no password, pending activation)
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        role: "TEAM_MEMBER",
        status: "PENDING_ACTIVATION",
        activationToken,
        activationTokenExpires: expiresAt,
        createdBy: currentUser.id,
      },
    });
    // Create activation URL
    const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/activate-account?token=${activationToken}`;
    // Send activation email
    const emailTemplate = createActivationEmailTemplate(fullName, activationUrl, "TEAM_MEMBER");
    const emailResult = await sendEmail({
      to: email,
      subject: "Welcome to Project Management System - Activate Your Account",
      html: emailTemplate,
    });
    if (!emailResult.success) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "Failed to send activation email. Please check your email configuration." },
        { status: 500 }
      );
    }
    return NextResponse.json({
      message: "Team member created successfully. Activation email sent.",
      userId: user.id,
      activationUrl
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      <style>/* ...same as project manager template... */</style>
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

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "TEAM_MEMBER"
      },
      select: {
        id: true,
        fullName: true,
        role: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}
