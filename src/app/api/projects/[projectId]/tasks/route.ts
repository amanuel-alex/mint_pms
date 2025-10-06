import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

// GET /api/projects/[projectId]/tasks
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        holder: user.name
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get all tasks for the project
    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.projectId
      },
      include: {
        assignee: true,
        createdBy: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/tasks
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        holder: user.name
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, priority, dueDate, assigneeId } = body;

    if (!title || !assigneeId) {
      return NextResponse.json(
        { error: "Title and assignee are required" },
        { status: 400 }
      );
    }

    // Verify the assignee is a team member created by this project manager
    const assignee = await prisma.teamMember.findFirst({
      where: {
        id: assigneeId,
        assignedById: user.id
      }
    });

    if (!assignee) {
      return NextResponse.json(
        { error: "Invalid team member" },
        { status: 400 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: params.projectId,
        assigneeId,
        createdById: user.id
      },
      include: {
        assignee: true,
        createdBy: {
          select: {
            fullName: true
          }
        }
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
} 