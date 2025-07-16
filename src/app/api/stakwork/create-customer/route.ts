import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import { stakworkService } from '@/lib/service-factory';
import { type ApiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerName } = body;

    const customer = await stakworkService().createCustomer(customerName);

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Error creating Stakwork customer:', error);
    
    // Handle ApiError specifically
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as ApiError;
      return NextResponse.json(
        { 
          error: apiError.message,
          service: apiError.service,
          details: apiError.details
        },
        { status: apiError.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 