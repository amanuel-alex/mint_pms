import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Current user:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Fetch projects for this user
    const userProjects = await prisma.$queryRaw`
      SELECT * FROM "Project"
      WHERE "holderId" = ${user.id}
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(userProjects);
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned projects" },
      { status: 500 }
    );
  }
}
