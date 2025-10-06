import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: user.id,
        updatedAt: { gte: thirtyDaysAgo }
      },
      select: {
        status: true,
        updatedAt: true,
        priority: true
      }
    });

    // Calculate analytics
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Priority breakdown
    const priorityBreakdown = {
      high: tasks.filter(t => t.priority === 'HIGH').length,
      medium: tasks.filter(t => t.priority === 'MEDIUM').length,
      low: tasks.filter(t => t.priority === 'LOW').length
    };

    // Weekly trends (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekTasks = tasks.filter(t => 
        t.updatedAt >= weekStart && t.updatedAt < weekEnd
      );
      
      weeklyData.push({
        week: `Week ${4-i}`,
        completed: weekTasks.filter(t => t.status === 'COMPLETED').length,
        total: weekTasks.length
      });
    }

    return NextResponse.json({
      completionRate,
      totalTasks,
      completedTasks,
      priorityBreakdown,
      weeklyTrends: weeklyData
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
} 