import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { removeGitHubToken } from '@/lib/github/token-manager';

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

    // Get user's GitHub token from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        githubToken: true,
      },
    });

    if (!dbUser || !dbUser.githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 404 }
      );
    }

    // Return the token (it will be decrypted if needed)
    return NextResponse.json({
      token: dbUser.githubToken,
    });
  } catch (error) {
    console.error('Error fetching GitHub token:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    await removeGitHubToken(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting GitHub:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect GitHub' },
      { status: 500 }
    );
  }
} 