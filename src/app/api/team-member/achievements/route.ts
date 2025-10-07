import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Calculate achievements based on user performance
    const achievements = [];

    // Get user stats
    const totalTasks = await prisma.task.count({
      where: { assignedToId: user.id, status: 'COMPLETED' }
    });

    const thisWeekTasks = await prisma.task.count({
      where: {
        assignedToId: user.id,
        status: 'COMPLETED',
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    const streak = await calculateStreak(user.id);

    // Define achievements
    if (totalTasks >= 10) achievements.push({
      id: 'first_10',
      title: 'Task Master',
      description: 'Completed 10 tasks',
      icon: '🎯',
      unlocked: true,
      progress: 100
    });

    if (thisWeekTasks >= 5) achievements.push({
      id: 'weekly_5',
      title: 'Weekly Warrior',
      description: 'Completed 5 tasks this week',
      icon: '⚡',
      unlocked: true,
      progress: 100
    });

    if (streak >= 3) achievements.push({
      id: 'streak_3',
      title: 'Consistency King',
      description: '3-day completion streak',
      icon: '🔥',
      unlocked: true,
      progress: 100
    });

    // Add more achievements as needed
    achievements.push({
      id: 'next_milestone',
      title: 'Next Milestone',
      description: 'Complete 20 tasks',
      icon: '🏆',
      unlocked: totalTasks >= 20,
      progress: Math.min((totalTasks / 20) * 100, 100)
    });

    return NextResponse.json(achievements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

async function calculateStreak(userId: string): Promise<number> {
  let streak = 0;
  const day = new Date();
  
  for (let i = 0; i < 7; i++) {
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const count = await prisma.task.count({
      where: {
        assignedToId: userId,
        status: "COMPLETED",
        updatedAt: { gte: start, lt: end }
      }
    });
    
    if (count > 0) {
      streak++;
      day.setDate(day.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
} 