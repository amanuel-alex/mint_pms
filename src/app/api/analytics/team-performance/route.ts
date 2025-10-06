import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            tasks: true
          }
        }
      }
    });

    const teamPerformance = teams.map(team => {
      const totalTasks = team.members.reduce((acc, member) => acc + member.tasks.length, 0);
      const completedTasks = team.members.reduce(
        (acc, member) => acc + member.tasks.filter(task => task.status === 'COMPLETED').length,
        0
      );

      return {
        team: team.name,
        completed: completedTasks,
        total: totalTasks,
        color: getTeamColor(team.name)
      };
    });

    return NextResponse.json(teamPerformance);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team performance' },
      { status: 500 }
    );
  }
}

function getTeamColor(teamName: string): string {
  const colors = {
    'Development': 'bg-blue-500',
    'Design': 'bg-purple-500',
    'QA': 'bg-green-500',
    'DevOps': 'bg-orange-500',
    'default': 'bg-gray-500'
  };

  return colors[teamName as keyof typeof colors] || colors.default;
} 