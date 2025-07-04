import { NextRequest, NextResponse } from 'next/server';
import { checkAuthStatus } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ challenge: string }> }
) {
  try {
    const { challenge } = await params;
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Missing challenge parameter' },
        { status: 400 }
      );
    }

    const authResponse = await checkAuthStatus(challenge);
    if (!authResponse) {
      return NextResponse.json({ status: 'pending' });
    }

    return NextResponse.json({
      status: 'success',
      ...authResponse,
    });
  } catch (error) {
    console.error('Error in poll challenge:', error);
    return NextResponse.json(
      { error: 'Failed to poll authentication challenge' },
      { status: 500 }
    );
  }
} 