import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkGitHubTokenStatus, refreshGitHubToken, getGitHubTokenInfo } from '@/lib/github/token-manager';

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

    // Check token status
    const status = await checkGitHubTokenStatus(user.id);
    
    return NextResponse.json({
      ...status,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error checking GitHub token status:', error);
    return NextResponse.json(
      { error: 'Failed to check token status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current authenticated user
    const user = getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      // Refresh the token
      const success = await refreshGitHubToken(user.id);
      
      if (!success) {
        return NextResponse.json(
          { error: 'No GitHub token found to refresh' },
          { status: 404 }
        );
      }

      // Get updated token info
      const tokenInfo = await getGitHubTokenInfo(user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
        tokenInfo,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error refreshing GitHub token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 