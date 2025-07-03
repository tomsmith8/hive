import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    // Generate OAuth URL
    const oauthUrl = GitHubService.getOAuthUrl();
    
    // Redirect to GitHub OAuth
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error('GitHub OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/codegraph?error=oauth_init_failed', request.url));
  }
} 