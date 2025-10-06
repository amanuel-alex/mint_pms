import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

const SECRET = process.env.JWT_SECRET || "your-secret"; // put this in .env

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  console.log("User data:", user); // Debug log

  // Create JWT
  const token = sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.fullName // Include name in JWT
    },
    SECRET,
    { expiresIn: "1h" }
  );

  // Set cookie
  const response = NextResponse.json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.fullName, // Use fullName as name
      role: user.role,
    },
  });

  response.headers.set(
    "Set-Cookie",
    serialize("token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
    })
  );

  return response;
}
