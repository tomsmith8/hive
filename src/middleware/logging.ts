import { NextRequest, NextResponse } from 'next/server';

export function createLoggingMiddleware() {
  return function loggingMiddleware(request: NextRequest): NextResponse | null {
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

export function logRequest(request: NextRequest, status: number, duration: number) {
  const pathname = request.nextUrl.pathname;
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - ${status} - ${duration}ms`);
}

export function withLogging<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    console.log(`[${operationName}] Starting...`);
    
    try {
      const result = await fn(...args);
      console.log(`[${operationName}] Completed successfully`);
      return result;
    } catch (error) {
      console.error(`[${operationName}] Failed:`, error);
      throw error;
    }
  };
} 