import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";
import { NotificationType, TaskStatus } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { status } = await request.json();

  // Only allow updating tasks assigned to the current user
  const task = await prisma.task.findUnique({
    where: { id: taskId, assignedToId: user.id },
    include: {
      project: {
        select: { id: true, name: true, holderId: true },
      },
    },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  // Notify project manager when a task is marked as completed by the assignee
  try {
    if (status === TaskStatus.COMPLETED && task?.project?.holderId) {
      await prisma.notification.create({
        data: {
          type: NotificationType.TASK_STATUS_CHANGED,
          message: `Task "${task.title}" was marked as completed by ${user.fullName || 'a team member'}.`,
          userId: task.project.holderId,
          projectId: task.project.id,
        },
      });
    }
  } catch (e) {
    console.error("Failed to create completion notification:", e);
  }

  return NextResponse.json({ task: updatedTask });
} 