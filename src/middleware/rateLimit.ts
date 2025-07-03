import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for rate limiting
// In production, you'd want to use Redis or a database
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export function createRateLimitMiddleware(config: RateLimitConfig = defaultConfig) {
  return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const now = Date.now();
    const key = `${ip}:${request.nextUrl.pathname}`;
    
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
          },
        }
      );
    }
    
    // Increment count
    current.count++;
    rateLimitStore.set(key, current);
    
    return null; // Allow request
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute 