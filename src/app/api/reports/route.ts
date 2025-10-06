import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, which is fine
    console.log("Uploads directory already exists or could not be created");
  }
  return uploadDir;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse multipart form data using FormData API
    const formData = await request.formData();
    
    const taskId = formData.get("taskId") as string;
    const projectId = formData.get("projectId") as string;
    const description = formData.get("description") as string;
    const recipientId = formData.get("recipientId") as string;
    const file = formData.get("file") as File;

    // Fetch recipient
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Role-based validation
    if (user.role === "TEAM_MEMBER") {
      // Team member must provide taskId and send to manager
      if (!taskId || !recipientId || !file) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      if (recipient.role !== "PROJECT_MANAGER") {
        return NextResponse.json(
          { error: "Team members can only send reports to managers" },
          { status: 403 }
        );
      }
      // Fetch the task to get the title
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = await ensureUploadsDir();
      const filePath = path.join(uploadDir, fileName);
      try {
        await writeFile(filePath, buffer);
      } catch (error) {
        console.error("Error writing file:", error);
        return NextResponse.json(
          { error: "Failed to save file" },
          { status: 500 }
        );
      }
      const fileUrl = `/uploads/${fileName}`;
      // Create report
      const report = await prisma.report.create({
        data: {
          title: task.title,
          taskId,
          description,
          fileUrl,
          fileName: file.name,
          fileType: file.type,
          senderId: user.id,
          recipientId,
        },
        include: {
          sender: { select: { id: true, fullName: true, email: true } },
          recipient: { select: { id: true, fullName: true, email: true } },
        },
      });
      return NextResponse.json(report);
    } else if (user.role === "PROJECT_MANAGER") {
      // Manager must provide projectId and send to admin
      if (!projectId || !recipientId || !file) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      if (recipient.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Managers can only send reports to admins" },
          { status: 403 }
        );
      }
      // Fetch the project to get the title
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const uploadDir = await ensureUploadsDir();
      const filePath = path.join(uploadDir, fileName);
      try {
        await writeFile(filePath, buffer);
      } catch (error) {
        console.error("Error writing file:", error);
        return NextResponse.json(
          { error: "Failed to save file" },
          { status: 500 }
        );
      }
      const fileUrl = `/uploads/${fileName}`;
      // Create report
      const report = await prisma.report.create({
        data: {
          title: project.name,
          description,
          fileUrl,
          fileName: file.name,
          fileType: file.type,
          senderId: user.id,
          recipientId,
        },
        include: {
          sender: { select: { id: true, fullName: true, email: true } },
          recipient: { select: { id: true, fullName: true, email: true } },
        },
      });
      return NextResponse.json(report);
    } else {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "received"; // "sent" or "received"
    const status = searchParams.get("status"); // "PENDING", "APPROVED", "REJECTED"

    const where: any = {
      ...(type === "sent" ? { senderId: user.id } : { recipientId: user.id }),
    };
    if (status) {
      where.status = status.toUpperCase();
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
