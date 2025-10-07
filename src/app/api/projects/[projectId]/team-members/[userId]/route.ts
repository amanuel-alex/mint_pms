import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string; userId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        holder: user.id
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Remove the team member
    const updatedProject = await prisma.project.update({
      where: {
        id: params.projectId
      },
      data: {
        teamMembers: {
          disconnect: {
            id: params.userId
          }
        }
      },
      include: {
        teamMembers: true
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
} 