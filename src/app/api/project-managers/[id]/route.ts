import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch manager" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { fullName, email } = body;
    const { id } = await params;
    const user = await prisma.user.update({
      where: { id },
      data: { fullName, email },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update manager" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        projectsManaged: true,
        assignedTasks: true,
        notifications: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has related data that would prevent deletion
    if (user.projectsManaged.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete user. They are managing ${user.projectsManaged.length} project(s). Please reassign or delete these projects first.` 
      }, { status: 400 });
    }

    if (user.assignedTasks.length > 0) {
      return NextResponse.json({ 
        error: `Cannot delete user. They have ${user.assignedTasks.length} assigned task(s). Please reassign these tasks first.` 
      }, { status: 400 });
    }

    // Delete related notifications first (if any)
    if (user.notifications.length > 0) {
      await prisma.notification.deleteMany({
        where: { userId: id }
      });
    }

    // Now delete the user
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ 
      error: "Failed to delete manager: " + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 });
  }
}
