import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";
import { TaskStatus } from "@prisma/client";

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

  // Fetch incomplete tasks (treat COMPLETED, CANCELLED, REVIEW, and BLOCKED as acceptable)
  // Define acceptable statuses for final report
  const acceptableStatuses = [TaskStatus.COMPLETED, TaskStatus.REVIEW, TaskStatus.BLOCKED];

  const incompleteTasks = await prisma.task.findMany({
    where: { projectId, status: { notIn: acceptableStatuses } },
    select: { id: true, title: true, status: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    allCompleted: incompleteTasks.length === 0,
    incompleteTasks,
  });
} 