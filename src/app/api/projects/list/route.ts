import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, holder, status, budget, description } = await req.json();
    const project = await prisma.project.create({
      data: { name, holder, status, budget, description },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET() {
//   const projects = await prisma.project.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: "asc" },
//   });
//   return NextResponse.json(projects);
// }
