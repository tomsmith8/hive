console.log('DATABASE_URL:', process.env.DATABASE_URL);

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connection with a simple query
    const result = await prisma.$connect();
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 