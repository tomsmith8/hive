import { NextRequest, NextResponse } from 'next/server';
import { generateAuthChallenge } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const challenge = await generateAuthChallenge();
    
    return NextResponse.json({
      challenge: challenge.challenge,
      ts: challenge.ts,
    });
  } catch (error) {
    console.error('Error generating auth challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication challenge' },
      { status: 500 }
    );
  }
} 