import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function PATCH(request: Request, { params }: { params: { taskId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { taskId } = params;
  const { status } = await request.json();

  // Only allow updating tasks assigned to the current user
  const task = await prisma.task.findUnique({
    where: { id: taskId, assignedToId: user.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  return NextResponse.json({ task: updatedTask });
} 