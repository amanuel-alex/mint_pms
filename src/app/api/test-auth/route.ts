import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/serverAuth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        message: 'No user found' 
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Authentication error' 
    });
  }
} 