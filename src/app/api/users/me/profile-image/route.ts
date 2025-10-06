import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/serverAuth";
import prisma from "@/lib/prisma";
import path from "path";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-images');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    const imageUrl = `/uploads/profile-images/${fileName}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { profileImageUrl: imageUrl },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 