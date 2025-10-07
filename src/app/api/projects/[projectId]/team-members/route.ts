import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
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

    // Add the team member
    const updatedProject = await prisma.project.update({
      where: {
        id: params.projectId
      },
      data: {
        teamMembers: {
          connect: {
            id: userId
          }
        }
      },
      include: {
        teamMembers: true
      }
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
} 