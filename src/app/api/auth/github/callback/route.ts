import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GitHubService } from '@/lib/github';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/codegraph?error=oauth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/codegraph?error=no_code', request.url));
  }

  try {
    // Exchange code for access token
    const accessToken = await GitHubService.exchangeCodeForToken(code);

    // Get user information
    const userData = await GitHubService.getUser(accessToken);

    // Get user's organizations
    const orgsData = await GitHubService.getUserOrganizations(accessToken);

    // For now, we'll use a placeholder user ID since we don't have the current user context
    // In a real implementation, you'd get this from the session
    const placeholderUserId = 'temp-user-id';

    // Update user with GitHub information
    await prisma.user.update({
      where: { id: placeholderUserId },
      data: {
        githubToken: accessToken,
        githubUsername: userData.login,
        githubUserId: userData.id.toString(),
        githubOrganizations: orgsData as any,
      },
    });

    // Redirect back to codegraph page with success
    return NextResponse.redirect(new URL('/codegraph?step=organizations', request.url));

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return NextResponse.redirect(new URL('/codegraph?error=callback_failed', request.url));
  }
} 