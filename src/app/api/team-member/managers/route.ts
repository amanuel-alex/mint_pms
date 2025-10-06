import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all projects where the current user has tasks assigned
  const projects = await prisma.project.findMany({
    where: {
      tasks: {
        some: {
          assignedToId: user.id,
        },
      },
      holderId: { not: null },
    },
    select: {
      holderId: true,
    },
  });

  const managerIds = Array.from(new Set(projects.map((p) => p.holderId))).filter((id): id is string => !!id);

  if (managerIds.length === 0) {
    return NextResponse.json([]);
  }

  // Get only those managers
  const managers = await prisma.user.findMany({
    where: {
      id: { in: managerIds },
      role: "PROJECT_MANAGER",
    },
    select: { id: true, fullName: true, email: true },
  });
  return NextResponse.json(managers);
} 