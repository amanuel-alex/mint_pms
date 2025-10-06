import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all tasks for the team member
    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: user.id
      },
      select: {
        id: true,
        status: true
      }
    });

    // Get notifications count
    const notifications = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    // Get projects count
    const projects = await prisma.project.count({
      where: {
        teams: {
          some: {
            members: {
              some: {
                id: user.id
              }
            }
          }
        }
      }
    });

    // Calculate task statistics
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(task => task.status !== 'COMPLETED').length;
    const totalTasks = tasks.length;

    return NextResponse.json({
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks
      },
      notifications,
      projects
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 