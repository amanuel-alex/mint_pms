// app/api/dashboard/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUser } from "@/lib/serverAuth";

const SECRET = process.env.JWT_SECRET || "your-secret";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to access the dashboard" },
        { status: 401 }
      );
    }

    // Get current project manager
    const currentManager = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    if (!currentManager) {
      return NextResponse.json(
        { error: "User not found - Please contact support" },
        { status: 404 }
      );
    }

    if (currentManager.role !== "PROJECT_MANAGER") {
      return NextResponse.json(
        {
          error:
            "Access denied - You must be a project manager to view this dashboard",
        },
        { status: 403 }
      );
    }

    // Get all projects managed by this project manager
    const projects = await prisma.project.findMany({
      where: {
        holderId: currentManager.id
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get team members count (team members created by this manager or assigned to their projects)
    const teamMembers = await prisma.user.count({
      where: {
        role: "TEAM_MEMBER",
        OR: [
          // Team members created by this manager
          {
            createdBy: currentManager.id
          },
          // Team members in teams of projects managed by this manager
          {
            teams: {
              some: {
                projects: {
                  some: {
                    holderId: currentManager.id
                  }
                }
              }
            }
          },
          // Team members with assigned tasks from projects managed by this manager
          {
            assignedTasks: {
              some: {
                project: {
                  holderId: currentManager.id
                }
              }
            }
          }
        ]
      },
    });

    // Get all tasks for projects managed by this manager
    const allTasks = await prisma.task.findMany({
      where: {
        project: {
          holderId: currentManager.id
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    // Calculate task statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task.status === "COMPLETED").length;
    const inProgressTasks = allTasks.filter(task => task.status === "IN_PROGRESS").length;
    const todoTasks = allTasks.filter(task => task.status === "TODO").length;
    const blockedTasks = allTasks.filter(task => task.status === "BLOCKED").length;
    const reviewTasks = allTasks.filter(task => task.status === "REVIEW").length;

    // Calculate overall progress percentage
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get project status counts
    const projectStatusCounts = await prisma.project.groupBy({
      by: ["status"],
      where: {
        holderId: currentManager.id
      },
      _count: true,
    });

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentManager.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Create enhanced progress data for charts
    const taskProgressData = [
      { status: "Completed", count: completedTasks, percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0, color: "#10B981" },
      { status: "In Progress", count: inProgressTasks, percentage: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0, color: "#3B82F6" },
      { status: "Review", count: reviewTasks, percentage: totalTasks > 0 ? Math.round((reviewTasks / totalTasks) * 100) : 0, color: "#F59E0B" },
      { status: "Todo", count: todoTasks, percentage: totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0, color: "#6B7280" },
      { status: "Blocked", count: blockedTasks, percentage: totalTasks > 0 ? Math.round((blockedTasks / totalTasks) * 100) : 0, color: "#EF4444" }
    ];

    // Create project-wise progress data
    const projectProgressData = projects.map(project => {
      const projectTasks = allTasks.filter(task => task.projectId === project.id);
      const projectCompletedTasks = projectTasks.filter(task => task.status === "COMPLETED").length;
      const projectProgress = projectTasks.length > 0 ? Math.round((projectCompletedTasks / projectTasks.length) * 100) : 0;
      
      return {
        projectName: project.name,
        totalTasks: projectTasks.length,
        completedTasks: projectCompletedTasks,
        progress: projectProgress,
        status: project.status
      };
    });

    // Get recent task updates (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTaskUpdates = allTasks
      .filter(task => new Date(task.updatedAt) >= sevenDaysAgo)
      .slice(0, 10)
      .map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        projectName: task.project.name,
        assignedTo: task.assignedTo?.fullName || "Unassigned",
        updatedAt: task.updatedAt
      }));

    // Format the data
    const formattedData = {
      currentManager: {
        id: currentManager.id,
        fullName: currentManager.fullName,
        email: currentManager.email,
        role: currentManager.role
      },
      projects: projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        budget: project.budget,
        status: project.status,
        holder: currentManager.fullName,
        holderId: currentManager.id,
        holderEmail: currentManager.email,
        updatedAt: project.updatedAt,
        createdAt: project.createdAt
      })),
      performance: {
        activeMembers: teamMembers,
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        overallProgress: overallProgress
      },
      deadlines: projects
        .filter((p) => p.status === "IN_PROGRESS")
        .map((project) => ({
          name: project.name,
          date: formatDistanceToNow(new Date(project.updatedAt), {
            addSuffix: true,
          }),
        }))
        .slice(0, 5),
      progress: taskProgressData,
      projectProgress: projectProgressData,
      recentTaskUpdates: recentTaskUpdates,
      taskStatistics: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        blocked: blockedTasks,
        review: reviewTasks,
        overallProgress: overallProgress
      },
      notifications: notifications.map((notification) => ({
        id: notification.id,
        message: notification.message,
        createdAt: formatDistanceToNow(new Date(notification.createdAt), {
          addSuffix: true,
        }),
      })),
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error in project manager dashboard API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
