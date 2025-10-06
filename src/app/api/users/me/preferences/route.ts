import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/serverAuth";
import prisma from "@/lib/prisma";

// Default user preferences
const defaultPreferences = {
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    taskAssignments: true,
    deadlineReminders: true,
    weeklyDigest: false,
  },
  display: {
    theme: 'light',
    compactMode: false,
    showProgressBars: true,
    showTimestamps: true,
  },
  privacy: {
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    showOnlineStatus: true,
  }
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user preferences from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true }
    });

    // Return default preferences if none exist
    const preferences = dbUser?.preferences || defaultPreferences;

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ 
      error: "Failed to fetch preferences" 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ 
        error: "Preferences data is required" 
      }, { status: 400 });
    }

    // Validate preferences structure
    const requiredSections = ['notifications', 'display', 'privacy'];
    for (const section of requiredSections) {
      if (!preferences[section]) {
        return NextResponse.json({ 
          error: `Missing required section: ${section}` 
        }, { status: 400 });
      }
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: user.id },
      data: { preferences }
    });

    return NextResponse.json({ 
      preferences,
      message: "Preferences updated successfully" 
    });

  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ 
      error: "Failed to update preferences" 
    }, { status: 500 });
  }
} 