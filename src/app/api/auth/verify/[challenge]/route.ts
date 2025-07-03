import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthChallenge } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { challenge: string } }
) {
  try {
    const { challenge } = params;
    const body = await request.json();
    const { key: pubKey, sig: signature } = body;

    // Add logging for debug
    console.log('Received /verify request:', { challenge, body });

    if (!challenge || !pubKey || !signature) {
      return NextResponse.json(
        { error: 'Missing required parameters: challenge, key, or sig' },
        { status: 400 }
      );
    }

    const isValid = await verifyAuthChallenge(challenge, pubKey, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature or expired challenge' },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error verifying auth challenge:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication challenge' },
      { status: 500 }
    );
  }
} 