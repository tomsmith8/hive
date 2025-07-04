console.log('DATABASE_URL:', process.env.DATABASE_URL);

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const challengeCount = await prisma.authChallenge.count();
    
    return NextResponse.json({
      success: true,
      userCount,
      challengeCount,
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 