import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    databaseUrl: process.env.DATABASE_URL || 'NOT_SET',
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...',
    allEnvVars: {
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV,
    }
  });
} 