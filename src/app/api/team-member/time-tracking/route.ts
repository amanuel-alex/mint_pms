import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const timeEntries = await prisma.timeEntry.findMany({
      where: { userId: user.id },
      include: { task: { select: { title: true, project: { select: { name: true } } } } },
      orderBy: { startTime: "desc" },
      take: 50
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { taskId, startTime, endTime, description } = await req.json();
    
    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId: user.id,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description
      }
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
} 