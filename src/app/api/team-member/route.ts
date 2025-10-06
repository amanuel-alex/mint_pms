import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get team member data with their teams and projects
    const teamMember = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      include: {
        teams: {
          include: {
            projects: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        assignedTasks: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedData = {
      id: teamMember.id,
      name: teamMember.fullName,
      email: teamMember.email,
      role: teamMember.role,
      teams: teamMember.teams.map(team => ({
        id: team.id,
        name: team.name,
        projects: team.projects
      })),
      tasks: teamMember.assignedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        project: task.project
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching team member data:", error);
    return NextResponse.json(
      { error: "Failed to fetch team member data" },
      { status: 500 }
    );
  }
} 