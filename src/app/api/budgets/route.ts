import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        project: {
          select: {
            name: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, allocation, expenses, status, date } = body;

    const budget = await prisma.budget.create({
      data: {
        projectId,
        allocation: parseFloat(allocation),
        expenses: parseFloat(expenses),
        status,
        date: new Date(date),
      },
      include: {
        project: {
          select: {
            name: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
} 