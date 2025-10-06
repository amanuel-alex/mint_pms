import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Find user with the activation token
    const user = await prisma.user.findUnique({
      where: { activationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid activation token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (user.activationTokenExpires && user.activationTokenExpires < new Date()) {
      return NextResponse.json(
        { error: "Activation token has expired" },
        { status: 400 }
      );
    }

    // Check if account is already activated
    if (user.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Account is already activated" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user as activated
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: "ACTIVE",
        activationToken: null,
        activationTokenExpires: null,
        activatedAt: new Date(),
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      message: "Account activated successfully",
    });
  } catch (error) {
    console.error("Error activating account:", error);
    return NextResponse.json(
      { error: "Failed to activate account" },
      { status: 500 }
    );
  }
} 