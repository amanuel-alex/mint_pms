import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/serverAuth';

// Helper function to convert BigInt to Number
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertBigIntToNumber(obj[key]);
    }
    return result;
  }

  return obj;
}

export async function GET() {
  try {
    console.log('Analytics API: Starting request');
    
    const user = await getCurrentUser();
    console.log('Analytics API: Current user:', user);

    if (!user) {
      console.log('Analytics API: No user found');
      return NextResponse.json({ error: 'Unauthorized - No user found' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      console.log('Analytics API: User is not admin', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    console.log('Analytics API: Fetching data...');

    // Get total projects
    const totalProjects = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Project"
    `;
    console.log('Analytics API: Total projects:', totalProjects);

    // Get projects by status
    const projectsByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM "Project" 
      GROUP BY status
    `;
    console.log('Analytics API: Projects by status:', projectsByStatus);

    // Get total budget
    const totalBudget = await prisma.$queryRaw`
      SELECT COALESCE(SUM(CAST(budget AS INTEGER)), 0) as total 
      FROM "Project"
    `;
    console.log('Analytics API: Total budget:', totalBudget);

    // Get total number of project managers
    const totalManagers = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT "holderId") as count
      FROM "Project"
      WHERE "holderId" IS NOT NULL
    `;
    console.log('Analytics API: Total managers:', totalManagers);

    // Get projects by manager
    const projectsByManager = await prisma.$queryRaw`
      SELECT 
        COALESCE(u."fullName", 'Unassigned') as manager,
        COUNT(p.id) as count
      FROM "Project" p
      LEFT JOIN "User" u ON p."holderId" = u.id
      GROUP BY u."fullName"
      ORDER BY count DESC
    `;
    console.log('Analytics API: Projects by manager:', projectsByManager);

    // Get recent projects
    const recentProjects = await prisma.$queryRaw`
      SELECT 
        p.*,
        COALESCE(u."fullName", 'Unassigned') as holder_name
      FROM "Project" p
      LEFT JOIN "User" u ON p."holderId" = u.id
      ORDER BY p."createdAt" DESC
      LIMIT 5
    `;
    console.log('Analytics API: Recent projects:', recentProjects);

    // Get project completion rate
    const completionRate = await prisma.$queryRaw`
      SELECT 
        COALESCE(
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0),
          0
        ) as rate
      FROM "Project"
    `;
    console.log('Analytics API: Completion rate:', completionRate);

    const response = {
      totalProjects: Number((totalProjects as any[])[0].count),
      projectsByStatus: convertBigIntToNumber(projectsByStatus),
      totalBudget: Number((totalBudget as any[])[0].total || 0),
      totalManagers: Number((totalManagers as any[])[0].count),
      projectsByManager: convertBigIntToNumber(projectsByManager),
      recentProjects: convertBigIntToNumber(recentProjects),
      completionRate: Number((completionRate as any[])[0].rate || 0)
    };

    console.log('Analytics API: Sending response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics API: Error fetching analytics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 