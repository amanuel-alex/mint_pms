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

    // Get only projects where the team member has assigned tasks
    const projects = await prisma.project.findMany({
      where: {
        tasks: {
          some: {
            assignedToId: user.id
          }
        }
      },
      include: {
        teams: {
          where: {
            members: {
              some: {
                id: user.id
              }
            }
          },
          select: {
            id: true,
            name: true,
            members: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        tasks: {
          where: {
            assignedToId: user.id
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            deadline: true
          }
        }
      }
    });

    // Transform the data to use project name in team name
    const transformedProjects = projects.map(project => ({
      ...project,
      teams: project.teams.map(team => ({
        ...team,
        name: team.name.replace(`Team for Project ${project.id}`, `Team for ${project.name}`)
      }))
    }));

    return NextResponse.json({ projects: transformedProjects });
  } catch (error) {
    console.error("Error fetching team member projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
} 