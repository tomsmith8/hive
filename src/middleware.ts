import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { handleAuthMiddleware } from '@/middleware/auth'
import { createLoggingMiddleware } from '@/middleware/logging'
import { createRateLimitMiddleware } from '@/middleware/rateLimit'
import { composeMiddleware } from '@/middleware/composer'



// Create middleware chain
const middlewareChain = composeMiddleware(
  createLoggingMiddleware(),
  createRateLimitMiddleware({ maxRequests: 100, windowMs: 15 * 60 * 1000 }), // 100 requests per 15 minutes
  handleAuthMiddleware
);

export function middleware(request: NextRequest) {
  const result = middlewareChain(request);
  
  // If middleware returns a response, return it
  if (result) {
    return result;
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 