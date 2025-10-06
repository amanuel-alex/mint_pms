import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { SECRET } from "@/lib/serverAuth";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { newEmail } = await request.json();
    if (!newEmail) {
      return NextResponse.json({ error: "New email is required" }, { status: 400 });
    }

    // Ensure new email not used by another user
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Create a signed token containing userId and newEmail, exp 1 hour
    const token = jwt.sign({ userId: user.id, newEmail }, SECRET, { expiresIn: "1h" });

    const originHeader = request.headers.get("origin");
    const url = new URL(request.url);
    const fallback = `${url.protocol}//${url.host}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || originHeader || fallback;
    const confirmUrl = `${baseUrl}/api/users/me/change-email/confirm?token=${encodeURIComponent(token)}`;

    const html = `
      <p>You requested to change your account email to <strong>${newEmail}</strong>.</p>
      <p>Click the button below to confirm this change. This link expires in 1 hour.</p>
      <p><a href="${confirmUrl}" style="display:inline-block;padding:10px 16px;background:#087684;color:#fff;border-radius:6px;text-decoration:none">Confirm Email Change</a></p>
    `;

    await sendEmail({ to: newEmail, subject: "Confirm your email change", html });

    return NextResponse.json({ message: "Confirmation email sent" });
  } catch (error) {
    console.error("Change email request error:", error);
    return NextResponse.json({ error: "Failed to request email change" }, { status: 500 });
  }
}


