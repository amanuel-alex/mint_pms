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

    // Get all team members managed by this manager
    const teamMembers = await prisma.user.findMany({
      where: {
        OR: [
          // Team members created by this manager
          {
            createdBy: user.id
          },
          // Team members in teams of projects managed by this manager
          {
            teams: {
              some: {
                projects: {
                  some: {
                    holderId: user.id
                  }
                }
              }
            }
          },
          // Team members directly assigned to projects managed by this manager
          {
            assignedTasks: {
              some: {
                project: {
                  holderId: user.id
                }
              }
            }
          }
        ],
        role: "TEAM_MEMBER"
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            deadline: true,
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

    console.log('Found team members:', teamMembers.length);

    // Transform the data to match the frontend interface
    const transformedMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.fullName,
      email: member.email,
      tasks: member.assignedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        project: task.project
      }))
    }));

    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error("Error fetching manager's team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
} 