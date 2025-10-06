import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function PUT(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName } = body;

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Verify the team member belongs to a project managed by this user
    const teamMember = await prisma.user.findFirst({
      where: {
        id: params.memberId,
        teams: {
          some: {
            projects: {
              some: {
                holderId: user.id
              }
            }
          }
        }
      }
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found or not authorized" },
        { status: 404 }
      );
    }

    // Update the team member's full name
    const updatedMember = await prisma.user.update({
      where: {
        id: params.memberId
      },
      data: {
        fullName
      },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
} 

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const memberId = params.memberId;
    console.log("Attempting to delete team member:", memberId);

    // Verify the team member exists and is a team member
    const teamMember = await prisma.user.findFirst({
      where: {
        id: memberId,
        role: "TEAM_MEMBER"
      },
      include: {
        assignedTasks: true,
        teams: true,
        notifications: true
      }
    });

    if (!teamMember) {
      console.log("Team member not found:", memberId);
      return NextResponse.json(
        { error: "Team member not found or not authorized" },
        { status: 404 }
      );
    }

    console.log("Found team member:", {
      id: teamMember.id,
      name: teamMember.fullName,
      tasks: teamMember.assignedTasks.length,
      teams: teamMember.teams.length,
      notifications: teamMember.notifications.length
    });

    // First, delete all notifications
    await prisma.notification.deleteMany({
      where: {
        userId: memberId
      }
    });

    // Then, unassign all tasks
    await prisma.task.updateMany({
      where: {
        assignedToId: memberId
      },
      data: {
        assignedToId: null
      }
    });

    // Then, remove team member from all teams
    for (const team of teamMember.teams) {
      await prisma.team.update({
        where: {
          id: team.id
        },
        data: {
          members: {
            disconnect: {
              id: memberId
            }
          }
        }
      });
    }

    // Finally, delete the team member
    await prisma.user.delete({
      where: {
        id: memberId
      }
    });

    console.log("Successfully deleted team member:", memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete team member" },
      { status: 500 }
    );
  }
} 