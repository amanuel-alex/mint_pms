import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/serverAuth';
import prisma from '@/lib/prisma';

// Default settings structure
const defaultSettings = {
  projects: {
    defaultStatus: 'PLANNED',
    defaultBudget: '0',
    requireDescription: false,
    allowFileUpload: true,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
    maxFileSize: 5, // MB
    autoAssignProjectManager: false,
    requireBudgetApproval: true,
  },
  notifications: {
    projectUpdates: true,
    taskAssignments: true,
    budgetAlerts: true,
    deadlineReminders: true,
    newUserRegistration: true,
    projectCompletion: true,
    budgetOverruns: true,
    systemMaintenance: false,
  },
  display: {
    showProjectId: true,
    showCreationDate: true,
    showBudget: true,
    showHolder: true,
    showTeamMembers: true,
    showProgressBar: true,
    compactMode: false,
    darkMode: false,
  },
  system: {
    allowUserRegistration: true,
    requireEmailVerification: true,
    maxProjectsPerUser: 10,
    maxTeamMembersPerProject: 20,
    sessionTimeout: 24, // hours
    backupFrequency: 'daily',
    enableAuditLog: true,
  }
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load settings from DB; if none, return defaults
    let settings = defaultSettings;
    try {
      const existing = await prisma.systemSettings.findFirst();
      if (existing?.settings) {
        settings = existing.settings;
      }
    } catch (error) {
      console.log('SystemSettings table not found, using defaults:', error);
      // Table doesn't exist yet, use defaults
    }
    return NextResponse.json({
      settings,
      message: 'Settings retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Settings PUT request received');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    // For development/testing, allow admin access if no user is found
    // In production, you should always require authentication
    if (!user) {
      console.log('No user found - checking if this is a development environment');
      // You can add a development check here if needed
      return NextResponse.json({ error: 'Unauthorized - Please log in as admin' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      console.log('User is not admin - forbidden');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('User is admin, processing request');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { settings } = body;

    if (!settings) {
      console.log('No settings in request body');
      return NextResponse.json(
        { error: 'Settings data is required' },
        { status: 400 }
      );
    }

    // Validate settings structure
    const requiredSections = ['projects', 'notifications', 'display', 'system'];
    for (const section of requiredSections) {
      if (!settings[section]) {
        console.log(`Missing section: ${section}`);
        return NextResponse.json(
          { error: `Missing required section: ${section}` },
          { status: 400 }
        );
      }
    }

    console.log('Settings validation passed');

    // Upsert settings in DB
    try {
      const existing = await prisma.systemSettings.findFirst();
      if (existing) {
        await prisma.systemSettings.update({
          where: { id: existing.id },
          data: { settings }
        });
      } else {
        await prisma.systemSettings.create({
          data: { settings }
        });
      }
    } catch (error) {
      console.log('SystemSettings table not found, cannot save settings:', error);
      return NextResponse.json(
        { error: 'Database not ready - please run: npx prisma db push' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings - ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 