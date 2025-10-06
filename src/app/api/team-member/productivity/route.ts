import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const productivityData = await Promise.all(days.map(async (day, i) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const count = await prisma.task.count({
        where: {
          assignedToId: user.id,
          status: "COMPLETED",
          updatedAt: {
            gte: day,
            lt: nextDay,
          },
        },
      });
      
      return {
        day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
        count,
        date: day
      };
    }));

    return NextResponse.json(productivityData);
  } catch (error) {
    console.error("Error fetching productivity data:", error);
    return NextResponse.json(
      { error: "Failed to fetch productivity data" },
      { status: 500 }
    );
  }
} 