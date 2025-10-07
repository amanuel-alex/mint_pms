import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET(
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

    // Verify the project exists and belongs to the current user
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        holder: user.name
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get team members assigned by this project manager
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        assignedById: user.id
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error("Error fetching available team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch available team members" },
      { status: 500 }
    );
  }
} 