import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch total projects
    const totalProjects = await prisma.project.count();

    // Fetch projects by status
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    // Fetch total budget
    const projects = await prisma.project.findMany({
      select: {
        budget: true,
      },
    });
    const totalBudget = projects.reduce((sum, project) => {
      const budget = parseFloat(project.budget.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(budget) ? 0 : budget);
    }, 0);

    // Fetch recent activities (last 5)
    const recentActivities = await prisma.notification.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Fetch project managers with their project counts
    const projectManagers = await prisma.user.findMany({
      where: {
        role: 'PROJECT_MANAGER',
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    // Get project counts for each manager
    const managerProjectCounts = await Promise.all(
      projectManagers.map(async (manager) => {
        const projects = await prisma.project.findMany({
          where: {
            holder: manager.fullName,
            status: {
              not: 'CANCELLED'
            }
          }
        });
        return {
          id: manager.id,
          name: manager.fullName,
          projectCount: projects.length
        };
      })
    );

    // Sort managers by project count in descending order
    const sortedManagerProjectCounts = managerProjectCounts.sort((a, b) => b.projectCount - a.projectCount);

    // Format the data
    const formattedData = {
      totalProjects,
      projectsByStatus: projectsByStatus.map(status => ({
        status: status.status,
        count: status._count._all,
      })),
      totalBudget: totalBudget.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        message: activity.message,
        createdAt: activity.createdAt,
        projectName: activity.project.name,
        userName: activity.user.fullName,
      })),
      projectManagers: sortedManagerProjectCounts,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
} 