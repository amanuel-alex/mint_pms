import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all projects managed by this user
    const projects = await prisma.project.findMany({
      where: {
        holderId: user.id
      },
      include: {
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        teams: {
          include: {
            members: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((sum, project) => sum + project.tasks.length, 0);
    const completedTasks = projects.reduce((sum, project) => 
      sum + project.tasks.filter(task => task.status === "COMPLETED").length, 0
    );

    // Get unique team members across all projects
    const allTeamMembers = new Set();
    projects.forEach(project => {
      project.teams.forEach(team => {
        team.members.forEach(member => {
          allTeamMembers.add(member.id);
        });
      });
    });
    const activeTeamMembers = allTeamMembers.size;

    // Get upcoming deadlines (tasks due within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = projects.flatMap(project =>
      project.tasks
        .filter(task => 
          task.deadline && 
          new Date(task.deadline) <= sevenDaysFromNow &&
          task.status !== "COMPLETED"
        )
        .map(task => ({
          projectName: project.name,
          taskName: task.title,
          dueDate: task.deadline,
        }))
    ).slice(0, 10); // Limit to 10 upcoming deadlines

    // Transform project data for the dashboard
    const projectStats = projects.map(project => ({
      id: project.id,
      name: project.name,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(task => task.status === "COMPLETED").length,
      inProgressTasks: project.tasks.filter(task => task.status === "IN_PROGRESS").length,
      teamMembers: project.teams.reduce((sum, team) => sum + team.members.length, 0),
      startDate: project.createdAt.toISOString(),
      endDate: project.updatedAt.toISOString(),
      status: project.status,
    }));

    const reportData = {
      projects: projectStats,
      totalProjects,
      totalTasks,
      completedTasks,
      activeTeamMembers,
      upcomingDeadlines,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating report data:", error);
    return NextResponse.json(
      { error: "Failed to generate report data" },
      { status: 500 }
    );
  }
} 