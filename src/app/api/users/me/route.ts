import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        fullName: true,
        email: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error("Error in /api/users/me:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const body = await request.json();
    const { fullName, profileImageUrl } = body;
    if (!fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    const updateData: any = { fullName };
    if (typeof profileImageUrl === 'string') {
      updateData.profileImageUrl = profileImageUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        fullName: true,
        email: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
} 