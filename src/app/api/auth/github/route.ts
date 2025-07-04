import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { getCurrentUser, generateOAuthState } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = getCurrentUser(request);
    
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/codegraph', request.url));
    }

    // Generate secure state parameter with user context
    const state = generateOAuthState(user.id);
    
    // Generate OAuth URL with state
    const oauthUrl = GitHubService.getOAuthUrl(state);
    
    // Redirect to GitHub OAuth
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error('GitHub OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/codegraph?error=oauth_init_failed', request.url));
  }
} 