import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { SECRET } from "@/lib/serverAuth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    try {
      const payload = jwt.verify(token, SECRET) as { userId: string; newEmail: string };

      // Ensure target email not used
      const exists = await prisma.user.findUnique({ where: { email: payload.newEmail } });
      if (exists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }

      // Update user email and mark emailVerified null until next verification if desired
      const updated = await prisma.user.update({
        where: { id: payload.userId },
        data: { email: payload.newEmail, emailVerified: new Date() },
        select: { id: true },
      });

      const appBase = process.env.NEXT_PUBLIC_APP_URL || `${new URL(request.url).protocol}//${new URL(request.url).host}`;
      return NextResponse.redirect(new URL(`/login?emailChanged=1`, appBase));
    } catch (e) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
  } catch (error) {
    console.error("Confirm email change error:", error);
    return NextResponse.json({ error: "Failed to confirm email change" }, { status: 500 });
  }
}


