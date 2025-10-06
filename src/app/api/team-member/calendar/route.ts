import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().getMonth();
    const year = searchParams.get('year') || new Date().getFullYear();

    const startDate = new Date(parseInt(year), parseInt(month), 1);
    const endDate = new Date(parseInt(year), parseInt(month) + 1, 0);

    const tasks = await prisma.task.findMany({
      where: {
        assignedToId: user.id,
        deadline: { gte: startDate, lte: endDate }
      },
      include: {
        project: { select: { name: true } }
      }
    });

    // Group tasks by date
    const calendarData = tasks.reduce((acc, task) => {
      const date = new Date(task.deadline).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        project: task.project.name
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json(calendarData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
} 