import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const managers = await prisma.user.findMany({
      where: { role: "PROJECT_MANAGER" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        activatedAt: true,
      },
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json({ users: managers });
  } catch (error) {
    console.error("Error fetching project managers:", error);
    return NextResponse.json({ error: "Failed to fetch project managers" }, { status: 500 });
  }
}
