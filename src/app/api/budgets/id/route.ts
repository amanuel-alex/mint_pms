import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const budget = await prisma.budget.findUnique({
    where: { id: params.id },
    include: { project: true },
  });
  if (!budget)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(budget);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const budget = await prisma.budget.update({
    where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  await prisma.budget.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
