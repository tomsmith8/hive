import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's GitHub data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        githubToken: true,
        githubUsername: true,
        githubUserId: true,
        githubOrganizations: true,
      },
    });

    if (!dbUser || !dbUser.githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 404 }
      );
    }

    // Return GitHub data (token will be handled securely by the frontend)
    return NextResponse.json({
      githubUsername: dbUser.githubUsername,
      githubUserId: dbUser.githubUserId,
      githubOrganizations: dbUser.githubOrganizations,
      hasToken: !!dbUser.githubToken,
    });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
} 