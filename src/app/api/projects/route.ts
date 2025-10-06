import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/serverAuth";

// GET: Fetch all projects, filter by holderId if provided
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching projects for user:', currentUser.id, 'Role:', currentUser.role);

    // If user is admin, fetch all projects. Otherwise, fetch only projects assigned to the user
    const whereClause = currentUser.role === 'ADMIN' 
      ? {} 
      : { holderId: currentUser.id };

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        holder: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        },
        teams: {
          include: {
            members: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            deadline: true,
            assignedToId: true,
            assignedTo: {
              select: {
                id: true,
                fullName: true,
                email: true,
              }
            }
          }
        }
      },
    });

    console.log('Found projects:', projects.length);
    projects.forEach(project => {
      console.log(`Project ${project.name}:`, {
        holder: project.holder?.fullName,
        teams: project.teams.length,
        tasks: project.tasks.length,
        members: project.teams.flatMap(t => t.members).length
      });
    });

    // Get team members created by the current user (for project managers)
    const createdTeamMembers = currentUser.role === 'PROJECT_MANAGER' 
      ? await prisma.user.findMany({
          where: {
            role: 'TEAM_MEMBER',
            createdBy: currentUser.id
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        })
      : [];

    // Transform the data to match the frontend interface
    const transformedProjects = projects.map(project => {
      // Get team members from teams associated with this project
      const teamMembers = project.teams.flatMap(team => 
        team.members.map(member => {
          const memberTasks = project.tasks.filter(task => task.assignedToId === member.id);
          console.log(`Member ${member.fullName} tasks:`, memberTasks.length);
          return {
            id: member.id,
            name: member.fullName,
            email: member.email,
            role: member.role,
            assignedTasks: memberTasks.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              deadline: task.deadline,
              assignedTo: task.assignedTo
            })),
            workload: memberTasks.length,
          };
        })
      );

      // Add team members created by the manager (if this is a project manager)
      const createdMembers = currentUser.role === 'PROJECT_MANAGER' 
        ? createdTeamMembers.map(member => {
            const memberTasks = project.tasks.filter(task => task.assignedToId === member.id);
            return {
              id: member.id,
              name: member.fullName,
              email: member.email,
              role: member.role,
              assignedTasks: memberTasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                deadline: task.deadline,
                assignedTo: task.assignedTo
              })),
              workload: memberTasks.length,
            };
          })
        : [];

      // Combine team members and created members, removing duplicates
      const allMembers = [...teamMembers, ...createdMembers];
      const uniqueMembers = allMembers.filter((member, index, self) => 
        index === self.findIndex(m => m.id === member.id)
      );

      return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        budget: project.budget,
        status: project.status,
        holder: project.holder?.fullName || 'Unassigned',
        holderId: project.holderId,
        holderEmail: project.holder?.email || '',
        updatedAt: project.updatedAt ? new Date(project.updatedAt).toISOString() : null,
        createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : null,
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter(task => task.status === 'COMPLETED').length,
        members: uniqueMembers,
      };
    });

    return NextResponse.json({ projects: transformedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST: Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, holderId, budget, description, fileName, fileUrl, status } = body;

    // Validate required fields
    if (!name || !holderId || budget === undefined) {
      return NextResponse.json(
        { error: "Name, holderId, and budget are required fields" },
        { status: 400 }
      );
    }

    // Validate budget is numeric
    budget = Number(budget);
    if (isNaN(budget)) {
      return NextResponse.json(
        { error: "Budget must be a number" },
        { status: 400 }
      );
    }

    // Validate optional status
    if (status && !Object.values(ProjectStatus).includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${Object.values(ProjectStatus).join(", ")}` },
        { status: 400 }
      );
    }

    // Confirm holder (user) exists
    const user = await prisma.user.findUnique({
      where: { id: holderId }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid holder ID" }, { status: 400 });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        holder: { connect: { id: user.id } },
        status: status || ProjectStatus.PLANNED,
        budget: String(budget),
        description: description || null,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
      },
    });

    // Get the current user (admin) who is creating the project
    const currentUser = await getCurrentUser();
    
    // Create notification for admin only (project creation)
    if (currentUser) {
      await prisma.notification.create({
        data: {
          type: "PROJECT_CREATED",
          message: `Project "${name}" has been created and assigned to ${user.fullName}`,
          userId: currentUser.id, // Notify the admin who created it
          projectId: project.id,
        },
      });
    }

    // Create notification for project manager (project assignment)
    await prisma.notification.create({
      data: {
        type: "PROJECT_ASSIGNED",
        message: `You have been assigned to manage project "${name}"`,
        userId: user.id, // Notify the project manager
        projectId: project.id,
      },
    });

    return NextResponse.json({
      project: {
        ...project,
        holder: user.fullName,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: `Failed to create project: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
