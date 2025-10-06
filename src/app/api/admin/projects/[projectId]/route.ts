import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/serverAuth';
import { ProjectStatus } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    console.log('PUT request received for project:', projectId);
    
    const user = await getCurrentUser();
    console.log('Current user:', user);

    if (!user) {
      console.log('Unauthorized: No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      console.log('Forbidden: User is not admin', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { name, budget, status, description, fileName, fileUrl, holderId } = body;

    // Verify that the project exists
    console.log('Verifying project exists:', projectId);
    const existingProject = await prisma.$queryRaw`
      SELECT id FROM "Project" WHERE id = ${projectId}
    `;

    if (!existingProject || !(existingProject as any[]).length) {
      console.log('Project not found:', projectId);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // If holderId is provided, verify the project manager exists
    if (holderId) {
      console.log('Verifying project manager:', holderId);
      const projectManager = await prisma.$queryRaw`
        SELECT id, "fullName" FROM "User" WHERE id = ${holderId}
      `;

      if (!projectManager || !(projectManager as any[]).length) {
        console.log('Project manager not found:', holderId);
        return NextResponse.json(
          { error: 'Project manager not found' },
          { status: 404 }
        );
      }
    }

    // Fetch the old project data for comparison
    const oldProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        budget: true,
        status: true,
        description: true,
        fileName: true,
        fileUrl: true,
        holderId: true,
      },
    });

    // Update the project
    console.log('Updating project:', { projectId, updates: body });
    
    // Build the update query based on provided fields
    let updateQuery = `
      UPDATE "Project"
      SET 
        name = $1,
        budget = $2,
        status = $3::"ProjectStatus",
        description = $4,
        "fileName" = $5,
        "fileUrl" = $6,
        "updatedAt" = NOW()
    `;

    const queryParams = [name, budget, status, description, fileName, fileUrl];

    if (holderId) {
      updateQuery += `, "holderId" = $${queryParams.length + 1}`;
      queryParams.push(holderId);
    }

    updateQuery += ` WHERE id = $${queryParams.length + 1}`;
    queryParams.push(projectId);

    await prisma.$executeRawUnsafe(updateQuery, ...queryParams);

    // Get the updated project with holder information
    const updatedProject = await prisma.$queryRaw`
      SELECT 
        p.*,
        u."fullName" as holder_name
      FROM "Project" p
      LEFT JOIN "User" u ON p."holderId" = u.id
      WHERE p.id = ${projectId}
    `;

    if (!updatedProject || !(updatedProject as any[]).length) {
      throw new Error('Failed to fetch updated project');
    }

    const projectData = (updatedProject as any[])[0];
    console.log('Project updated successfully:', projectData);

    // Compare old and new values for notification
    const changes: string[] = [];
    if (oldProject) {
      if (oldProject.name !== name) changes.push(`Name: '${oldProject.name}' → '${name}'`);
      if (oldProject.budget !== budget) changes.push(`Budget: '${oldProject.budget}' → '${budget}'`);
      if (oldProject.status !== status) changes.push(`Status: '${oldProject.status}' → '${status}'`);
      if (oldProject.description !== description) changes.push(`Description updated`);
      if (oldProject.fileName !== fileName) changes.push(`File name: '${oldProject.fileName}' → '${fileName}'`);
      if (oldProject.fileUrl !== fileUrl) changes.push(`File URL updated`);
      if (oldProject.holderId !== holderId) changes.push(`Project Manager changed`);
    }
    const changeMsg = changes.length > 0 ? changes.join('; ') : 'No significant changes.';

    // After updating the project, create a notification
    await prisma.notification.create({
      data: {
        type: "PROJECT_UPDATED",
        message: `Project '${projectData.name}' updated. Changes: ${changeMsg}`,
        userId: user.id,
        projectId: projectData.id,
      },
    });

    // If the project has a holder (project manager), notify them about the update
    if (projectData.holderId) {
      // Check if this is a new assignment (holderId changed)
      if (oldProject && oldProject.holderId !== holderId && holderId) {
        // Get the new project manager details
        const newProjectManager = await prisma.user.findUnique({
          where: { id: holderId },
          select: { fullName: true }
        });
        
        // Send assignment notification to the new project manager
        await prisma.notification.create({
          data: {
            type: "PROJECT_ASSIGNED",
            message: `You have been assigned to manage project "${projectData.name}" by admin ${user.name}`,
            userId: holderId,
            projectId: projectData.id,
          },
        });
      } else {
        // Regular update notification for existing project manager
        await prisma.notification.create({
          data: {
            type: "PROJECT_UPDATED",
            message: `Your project '${projectData.name}' has been updated by admin ${user.name}. Changes: ${changeMsg}`,
            userId: projectData.holderId, // Notify the project manager
            projectId: projectData.id,
          },
        });
      }
    }

    return NextResponse.json({
      project: {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        budget: projectData.budget,
        status: projectData.status,
        fileName: projectData.fileName,
        fileUrl: projectData.fileUrl,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
        holder: projectData.holder_name,
        holderId: projectData.holderId
      }
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update project' },
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
    console.log('DELETE request received for project:', projectId);
    
    const user = await getCurrentUser();
    console.log('Current user:', user);

    if (!user) {
      console.log('Unauthorized: No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      console.log('Forbidden: User is not admin', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify that the project exists
    console.log('Verifying project exists:', projectId);
    const existingProject = await prisma.$queryRaw`
      SELECT id, "holderId" FROM "Project" WHERE id = ${projectId}
    `;

    if (!existingProject || !(existingProject as any[]).length) {
      console.log('Project not found:', projectId);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const projectData = (existingProject as any[])[0];

    // If the project has a holder (project manager), notify them about the deletion
    if (projectData.holderId) {
      await prisma.notification.create({
        data: {
          type: "PROJECT_DELETED",
          message: `Your project has been deleted by admin ${user.name}.`,
          userId: projectData.holderId, // Notify the project manager
          projectId,
        },
      });
    }

    // Delete related notifications first
    console.log('Deleting related notifications');
    await prisma.$executeRaw`
      DELETE FROM "Notification"
      WHERE "projectId" = ${projectId}
    `;

    // Delete related tasks
    console.log('Deleting related tasks');
    await prisma.$executeRaw`
      DELETE FROM "Task"
      WHERE "projectId" = ${projectId}
    `;

    // Delete the project
    console.log('Deleting project');
    await prisma.$executeRaw`
      DELETE FROM "Project"
      WHERE id = ${projectId}
    `;

    // Note: Skipping creation of an admin notification tied to project here
    // because the Notification.project relation is required and the project
    // record has already been deleted.

    console.log('Project deleted successfully');
    return NextResponse.json({ 
      message: 'Project deleted successfully',
      projectId 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete project' },
      { status: 500 }
    );
  }
} 