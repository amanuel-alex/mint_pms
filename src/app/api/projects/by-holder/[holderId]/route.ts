import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ holderId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can view projects assigned to other users
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { holderId } = params;
    console.log("🔍 Looking for projects assigned to holderId:", holderId);

    // Verify the holder exists
    const holder = await prisma.user.findUnique({
      where: { id: holderId },
      select: { id: true, fullName: true, email: true, role: true }
    });

    console.log("👤 Holder found:", holder);

    if (!holder) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch projects assigned to this holder
    const projects = await prisma.project.findMany({
      where: {
        holderId: holderId
      },
      select: {
        id: true,
        name: true,
        description: true,
        budget: true,
        status: true,
        fileName: true,
        fileUrl: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log("📋 Projects found for holder:", projects.length);
    console.log("📋 Projects details:", projects);

    // Also check all projects to see if any have this holderId
    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        holderId: true
      }
    });
    console.log("🔍 All projects in database:", allProjects.map(p => ({ id: p.id, name: p.name, holderId: p.holderId })));

    return NextResponse.json({
      holder: {
        id: holder.id,
        fullName: holder.fullName,
        email: holder.email,
        role: holder.role
      },
      projects: projects
    });
  } catch (error) {
    console.error("Error fetching projects by holder:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
} 