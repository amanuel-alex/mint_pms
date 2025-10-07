import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(budget);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();
  const budget = await prisma.budget.update({
    where: { id },
    data: {
      ...data,
      date: new Date(data.date),
      allocation: parseFloat(data.allocation),
      expenses: parseFloat(data.expenses),
    },
  });
  return NextResponse.json(budget);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}


