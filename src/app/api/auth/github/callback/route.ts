import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GitHubService } from '@/lib/github';
import { parseOAuthState } from '@/lib/auth';

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

  if (!state) {
    return NextResponse.redirect(new URL('/codegraph?error=invalid_state', request.url));
  }

  try {
    // Parse and validate the state parameter to get the user ID
    const userId = parseOAuthState(state);
    
    if (!userId) {
      return NextResponse.redirect(new URL('/codegraph?error=invalid_state', request.url));
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/codegraph?error=user_not_found', request.url));
    }

    // Exchange code for access token
    const accessToken = await GitHubService.exchangeCodeForToken(code);

    // Get user information
    const userData = await GitHubService.getUser(accessToken);

    // Get user's organizations
    const orgsData = await GitHubService.getUserOrganizations(accessToken);

    // For now, store token as-is (TODO: implement encryption)
    // In production, this should be encrypted before storage
    const tokenToStore = process.env.NODE_ENV === 'production' 
      ? `encrypted:${accessToken}` // Placeholder for encryption
      : accessToken;

    // Update user with GitHub information
    await prisma.user.update({
      where: { id: userId },
      data: {
        githubToken: tokenToStore,
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