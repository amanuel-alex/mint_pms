import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get total projects
    const totalProjects = await prisma.project.count();
    
    // Get completed projects
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' }
    });

    // Get on-time projects
    const onTimeProjects = await prisma.project.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          lte: prisma.project.fields.dueDate
        }
      }
    });

    // Get resource utilization
    const totalTeamMembers = await prisma.user.count({
      where: { role: 'TEAM_MEMBER' }
    });
    const activeTeamMembers = await prisma.user.count({
      where: {
        role: 'TEAM_MEMBER',
        tasks: {
          some: {
            status: 'IN_PROGRESS'
          }
        }
      }
    });

    // Calculate budget efficiency
    const totalBudget = await prisma.project.aggregate({
      _sum: {
        budget: true
      }
    });
    const spentBudget = await prisma.project.aggregate({
      _sum: {
        spentBudget: true
      }
    });

    // Calculate metrics
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    const onTimeDelivery = completedProjects > 0 ? (onTimeProjects / completedProjects) * 100 : 0;
    const resourceUtilization = totalTeamMembers > 0 ? (activeTeamMembers / totalTeamMembers) * 100 : 0;
    const budgetEfficiency = totalBudget._sum.budget && spentBudget._sum.spentBudget
      ? ((totalBudget._sum.budget - spentBudget._sum.spentBudget) / totalBudget._sum.budget) * 100
      : 0;

    return NextResponse.json({
      completionRate: Math.round(completionRate),
      onTimeDelivery: Math.round(onTimeDelivery),
      resourceUtilization: Math.round(resourceUtilization),
      budgetEfficiency: Math.round(budgetEfficiency)
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 