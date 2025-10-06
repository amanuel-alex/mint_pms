import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const count = await prisma.notification.count({
      where: {
        isRead: false,
        userId: user.id,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread notifications count" },
      { status: 500 }
    );
  }
}
