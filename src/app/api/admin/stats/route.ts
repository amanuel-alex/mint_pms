import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get total active users (users created in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get total project managers
    const totalManagers = await prisma.user.count({
      where: {
        role: "PROJECT_MANAGER"
      }
    });

    // Get total projects
    const totalProjects = await prisma.project.count();

    // Get project counts by status
    const projectStatusCounts = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Convert the counts to a more usable format
    const projectCounts = {
      PLANNED: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    projectStatusCounts.forEach(({ status, _count }) => {
      projectCounts[status] = _count.status;
    });

    // Get all projects to calculate total budget
    const projects = await prisma.project.findMany({
      select: {
        budget: true
      }
    });

    // Calculate total budget
    const totalBudget = projects.reduce((sum, project) => {
      // Remove any currency symbols and convert to number
      const budgetValue = parseFloat(project.budget.replace(/[^0-9.-]+/g, ''));
      return sum + (isNaN(budgetValue) ? 0 : budgetValue);
    }, 0);

    return NextResponse.json({
      activeUsers,
      totalProjects,
      totalBudget,
      projectCounts,
      totalManagers
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
} 