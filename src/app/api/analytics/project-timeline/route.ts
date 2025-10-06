import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true
      }
    });

    const projectTimeline = projects.map(project => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        project: project.name,
        start: project.startDate.toISOString().split('T')[0],
        end: project.dueDate.toISOString().split('T')[0],
        progress: Math.round(progress)
      };
    });

    return NextResponse.json(projectTimeline);
  } catch (error) {
    console.error('Error fetching project timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project timeline' },
      { status: 500 }
    );
  }
} 