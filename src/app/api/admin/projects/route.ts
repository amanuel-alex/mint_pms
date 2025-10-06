import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    console.log("Current user:", user);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Fetching projects...");
    const projects = await prisma.project.findMany({
      include: {
        holder: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    console.log("Raw projects:", projects);

    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      budget: project.budget,
      status: project.status,
      fileName: project.fileName,
      fileUrl: project.fileUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      holder: project.holder?.fullName || "Unassigned",
      holderId: project.holderId || "",
    }));

    console.log("Transformed projects:", transformedProjects);

    return NextResponse.json({ projects: transformedProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST request received for new project");

    const user = await getCurrentUser();
    console.log("Current user:", user);

    if (!user) {
      console.log("Unauthorized: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      console.log("Forbidden: User is not admin", {
        userId: user.id,
        role: user.role,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    // Validate required fields
    if (!body.name?.trim()) {
      console.log("Bad request: Missing project name");
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!body.budget?.trim()) {
      console.log("Bad request: Missing budget");
      return NextResponse.json(
        { error: "Budget is required" },
        { status: 400 }
      );
    }

    if (isNaN(Number(body.budget))) {
      console.log("Bad request: Invalid budget format");
      return NextResponse.json(
        { error: "Budget must be a valid number" },
        { status: 400 }
      );
    }

    // Create the project
    console.log("Creating new project:", body);
    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        budget: body.budget.trim(),
        status: (body.status || "PLANNED") as any, // Prisma Client handles enum mapping
        fileName: body.fileName || null,
        fileUrl: body.fileUrl || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        holderId: null, // Default value for holderId
      },
    });

    console.log("Project created successfully:", project);

    // Create notification for project creation
    await prisma.notification.create({
      data: {
        type: "PROJECT_CREATED",
        message: `Project '${project.name}' has been created.`,
        userId: user.id,
        projectId: project.id,
      },
    });

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        budget: project.budget,
        status: project.status,
        fileName: project.fileName,
        fileUrl: project.fileUrl,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        holder: "Unassigned",
        holderId: null,
      },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create project",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, holderId } = body;

    if (!projectId || !holderId) {
      return NextResponse.json(
        { error: "Project ID and holder ID are required" },
        { status: 400 }
      );
    }

    // Get the project details before updating
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        holder: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get the project manager details
    const projectManager = await prisma.user.findUnique({
      where: { id: holderId },
      select: {
        id: true,
        fullName: true,
        role: true,
      },
    });

    if (!projectManager || projectManager.role !== "PROJECT_MANAGER") {
      return NextResponse.json({ error: "Invalid project manager" }, { status: 400 });
    }

    // Update the project with the new holder
    const project = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        holderId: holderId,
      },
      include: {
        holder: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create notification for the project manager about the assignment
    await prisma.notification.create({
      data: {
        type: "PROJECT_ASSIGNED",
        message: `You have been assigned to manage project "${project.name}" by admin ${user.name}`,
        userId: holderId,
        projectId: project.id,
      },
    });

    // Also create a notification for admin (optional)
    await prisma.notification.create({
      data: {
        type: "PROJECT_UPDATED",
        message: `Project "${project.name}" has been assigned to ${projectManager.fullName}`,
        userId: user.id, // Notify the admin
        projectId: project.id,
      },
    });

    return NextResponse.json({
      project: {
        ...project,
        holder: project.holder?.fullName || "Unassigned",
      },
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
