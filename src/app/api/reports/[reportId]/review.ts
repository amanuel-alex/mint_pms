import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PROJECT_MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = await params;
    const body = await request.json();
    const { action, comment } = body;
    if (!reportId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Find the report and ensure the manager is the recipient
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!report || report.recipientId !== user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    // Update report status and manager comment
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === "accept" ? "APPROVED" : "REJECTED",
        description: comment ? `${report.description || ""}\n\nManager: ${comment}` : report.description,
      },
    });

    // Log the review action (audit trail)
    await prisma.message.create({
      data: {
        content: `Report ${action === "accept" ? "approved" : "rejected"} by manager. Comment: ${comment}`,
        senderId: user.id,
        recipientId: report.senderId,
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error reviewing report:", error);
    return NextResponse.json({ error: "Failed to review report" }, { status: 500 });
  }
} 