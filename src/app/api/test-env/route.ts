import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    githubClientId: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set',
  });
} 