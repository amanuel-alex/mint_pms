import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request, contextPromise: Promise<{ params: { reportId: string } }>) {
  const { params } = await contextPromise;
  const reportId = params.reportId;

  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, comment } = body;

    if (!reportId || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Find the report and ensure the manager is the recipient
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (report.recipientId !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to review this report" },
        { status: 403 }
      );
    }

    // Update report status and add manager comment
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === "accept" ? "APPROVED" : "REJECTED",
        description: comment 
          ? `${report.description || ""}\n\nManager: ${comment}` 
          : report.description,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        recipient: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // If rejected and report has a taskId, set the task status to REVIEW
    if (action === "reject" && report.taskId) {
      await prisma.task.update({
        where: { id: report.taskId },
        data: { status: "REVIEW" },
      });
    }

    // Create a notification for the team member
    const notificationData: any = {
      type: "TASK_UPDATED",
      message: `Your report "${report.title}" has been ${action === "accept" ? "approved" : "rejected"} by ${user.name}.${comment ? ` Comment: ${comment}` : ""}`,
      userId: report.senderId,
    };

    if (report.taskId) {
      const task = await prisma.task.findUnique({ where: { id: report.taskId } });
      if (task) {
        notificationData.projectId = task.projectId;
      }
    }

    await prisma.notification.create({
      data: notificationData,
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error reviewing report:", error);
    return NextResponse.json(
      { error: "Failed to review report" },
      { status: 500 }
    );
  }
} 