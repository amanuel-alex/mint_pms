import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET(request: Request, context: { params: { projectId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projectId = context.params.projectId;

  // Check if user is the manager of the project
  const project = await prisma.project.findUnique({
    where: { id: projectId, holderId: user.id },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Count tasks that are not completed
  const incompleteCount = await prisma.task.count({
    where: { projectId, status: { not: "COMPLETED" } },
  });

  return NextResponse.json({ allCompleted: incompleteCount === 0 });
} 