import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const body = await request.json();
    if (!body.memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    const { projectId } = await params;
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // First, get or create a team for this project
    let team = await prisma.team.findFirst({
      where: {
        projects: {
          some: {
            id: projectId
          }
        }
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: `Team for Project ${projectId}`,
          projects: {
            connect: {
              id: projectId
            }
          }
        }
      });
    }

    // Add member to the team
    await prisma.team.update({
      where: { id: team.id },
      data: {
        members: {
          connect: {
            id: body.memberId
          }
        }
      }
    });

    // Fetch updated project data
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teams: {
          include: {
            members: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedProject = {
      id: updatedProject.id,
      name: updatedProject.name,
      members: updatedProject.teams.flatMap(team => 
        team.members.map(member => ({
          id: member.id,
          name: member.fullName,
          workload: 0, // This should be calculated based on assigned tasks
        }))
      ),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error adding member to project:', error);
    return NextResponse.json(
      { error: 'Failed to add member to project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const { projectId, memberId } = await params;

    // Find the team associated with this project
    const team = await prisma.team.findFirst({
      where: {
        projects: {
          some: {
            id: projectId
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Remove member from the team
    await prisma.team.update({
      where: { id: team.id },
      data: {
        members: {
          disconnect: {
            id: memberId
          }
        }
      }
    });

    // Fetch updated project data
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teams: {
          include: {
            members: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedProject = {
      id: updatedProject.id,
      name: updatedProject.name,
      members: updatedProject.teams.flatMap(team => 
        team.members.map(member => ({
          id: member.id,
          name: member.fullName,
          workload: 0, // This should be calculated based on assigned tasks
        }))
      ),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error removing member from project:', error);
    return NextResponse.json(
      { error: 'Failed to remove member from project' },
      { status: 500 }
    );
  }
} 