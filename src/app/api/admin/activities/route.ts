import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch recent activities from notifications
    const activities = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10, // Get last 10 activities
      include: {
        user: {
          select: {
            fullName: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    });

    // Format the activities
    const formattedActivities = activities.map(activity => {
      let title = '';
      let status = 'completed';

      switch (activity.type) {
        case 'PROJECT_CREATED':
          title = `New project "${activity.project?.name}" created`;
          break;
        case 'PROJECT_UPDATED':
          title = `Project "${activity.project?.name}" updated`;
          break;
        case 'PROJECT_DELETED':
          title = `Project "${activity.project?.name}" deleted`;
          break;
        case 'USER_REGISTERED':
          title = `New user "${activity.user?.fullName}" registered`;
          break;
        case 'TASK_ASSIGNED':
          title = `Task assigned to ${activity.user?.fullName}`;
          break;
        case 'BUDGET_UPDATED':
          title = `Budget updated for project "${activity.project?.name}"`;
          break;
        default:
          title = activity.message;
      }

      // Calculate time ago
      const now = new Date();
      const created = new Date(activity.createdAt);
      const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
      
      let timeAgo = '';
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
        timeAgo = `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        timeAgo = `${diffInDays} days ago`;
      }

      return {
        id: activity.id,
        title,
        time: timeAgo,
        status,
        type: activity.type,
        createdAt: activity.createdAt
      };
    });

    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 