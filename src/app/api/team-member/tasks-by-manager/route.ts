import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json(
        { error: "Manager ID is required" },
        { status: 400 }
      );
    }

    // Verify the manager exists and is a PROJECT_MANAGER
    const manager = await prisma.user.findFirst({
      where: {
        id: managerId,
        role: "PROJECT_MANAGER"
      }
    });

    if (!manager) {
      return NextResponse.json(
        { error: "Manager not found" },
        { status: 404 }
      );
    }

    // Get tasks from projects managed by the selected manager
    // that are assigned to the current team member
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: user.id,
        project: {
          holderId: managerId
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    // Transform the data to match the frontend interface
    const transformedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      project: task.project
    }));

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error("Error fetching tasks by manager:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
} 