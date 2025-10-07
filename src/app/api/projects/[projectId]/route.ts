import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const body = await request.json();
    const { name, holderId, status, budget, description, fileName, fileUrl } = body;

    // Validate required fields
    if (!name || !holderId || !budget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({
      where: { id: holderId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid holder ID" },
        { status: 400 }
      );
    }

    // Update the project with holder ID
    const { projectId } = await params;

    const project = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        name,
        holder: { connect: { id: user.id } }, // Correct relation syntax
        status: status as ProjectStatus,
        budget,
        description: description || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
      },
    });
    return NextResponse.json({
      ...project,
      holder: user.fullName,
      holderId: user.id
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// PATCH: Partial update (e.g., budget only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const body = await request.json();
    const { budget, description } = body;

    // Validate that at least one field is provided
    if (budget === undefined && description === undefined) {
      return NextResponse.json(
        { error: "At least one field (budget or description) must be provided" },
        { status: 400 }
      );
    }

    // Validate budget if provided
    if (budget !== undefined) {
      if (budget === null || budget === "") {
        return NextResponse.json(
          { error: "Budget cannot be empty" },
          { status: 400 }
        );
      }
      if (isNaN(parseFloat(budget))) {
        return NextResponse.json(
          { error: "Budget must be a valid number" },
          { status: 400 }
        );
      }
    }

    // Build update data object
    const updateData: any = {};
    if (budget !== undefined) updateData.budget = String(budget);
    if (description !== undefined) updateData.description = description || null;

    // Update the project
    const { projectId } = await params;

    const project = await prisma.project.update({
      where: {
        id: projectId
      },
      data: updateData,
      include: {
        holder: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({
      ...project,
      holder: project.holder?.fullName || 'Unassigned',
      holderId: project.holderId
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    // Delete related notifications first
    await prisma.notification.deleteMany({
      where: { projectId },
    });
    // Now delete the project
    await prisma.project.delete({
      where: { id: projectId },
    });
    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
