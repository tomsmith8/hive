import { NextRequest, NextResponse } from 'next/server';

export function createLoggingMiddleware() {
  return function loggingMiddleware(request: NextRequest): NextResponse | null {
    const startTime = Date.now();
    const { pathname, search } = request.nextUrl;
    const method = request.method;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Log the incoming request
    console.log(`[${new Date().toISOString()}] ${method} ${pathname}${search} - ${ip} - ${userAgent}`);

    // Return null to continue processing
    return null;
  };
}

export function logResponse(request: NextRequest, response: NextResponse, startTime: number) {
  const duration = Date.now() - startTime;
  const { pathname } = request.nextUrl;
  const status = response.status;
  
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - ${status} - ${duration}ms`);
} 