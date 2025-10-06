import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";
import { NotificationType } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { memberId } = params;

    // Fetch all tasks assigned to this team member
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: memberId,
        project: {
          holderId: user.id // Only tasks from projects managed by this user
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching team member tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch team member tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`[TASK_ASSIGNMENT] User ${user.id} attempting to assign task`);
    console.log(`[TASK_ASSIGNMENT] Current user role: ${user.role}`);

    const body = await request.json();
    const { taskId, dueDate } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    console.log(`[TASK_ASSIGNMENT] Looking for task ${taskId}`);

    // Verify the task exists and belongs to a project managed by this user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          holderId: user.id
        }
      },
      include: {
        project: true
      }
    });

    if (!task) {
      console.log(`[TASK_ASSIGNMENT] Task not found with project.holderId = ${user.id}`);
      // Additional check if task exists in other projects
      const taskExists = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true }
      });
      
      if (taskExists) {
        console.log(`[TASK_ASSIGNMENT] Task exists but belongs to another project manager`);
        return NextResponse.json(
          { error: "Task not found or access unauthorized. Please ensure you are the project manager for this task." },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }
    }

    console.log(`[TASK_ASSIGNMENT] Found task: ${task.title} in project: ${task.project.name}`);

    // Get the memberId from params
    const memberId = params.memberId;

    // Update the task with the assigned team member
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        assignedToId: memberId,
        deadline: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignedTo: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Create notification for the assigned member
    await prisma.notification.create({
      data: {
        type: NotificationType.TASK_CREATED,
        message: `You have been assigned to task "${updatedTask.title}"`,
        userId: memberId,
        projectId: task.projectId,
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json(
      { error: "Failed to assign task" },
      { status: 500 }
    );
  }
} 