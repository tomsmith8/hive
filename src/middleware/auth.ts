import { NextRequest, NextResponse } from 'next/server';

/**
 * ROUTE PROTECTION CONFIGURATION
 * 
 * To add new protected routes, simply add them to the protectedRoutePatterns array below.
 * 
 * Examples:
 * - '/dashboard' - protects /dashboard and all sub-routes like /dashboard/analytics
 * - '/admin' - protects all routes starting with /admin
 * - '/user/profile' - protects /user/profile specifically
 * 
 * To add a new protected page:
 * 1. Add the route to protectedRoutePatterns below
 * 2. Add client-side auth check to the page component (see existing pages for examples)
 * 3. Add the route to the navigation in Sidebar.tsx if needed
 */
const protectedRoutePatterns = [
  // Core app routes (protected)
  '/dashboard',
  '/tasks', 
  '/kanban',
  '/codegraph',
  '/settings',
  
  // Add new protected routes here:
  '/analytics',
  // '/reports',
  // '/admin',
  // '/user',
];

// Routes that should always be public (even if they match a pattern above)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/debug',
];

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePatterns.some(route => pathname.startsWith(route));
}

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route);
}

export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get('jwt_token')?.value || 
         request.headers.get('authorization')?.replace('Bearer ', '') ||
         null;
}

// Only check for presence of token, do not verify in middleware
export function verifyAuthToken(token: string): boolean {
  // In middleware, just check if token exists
  return !!token;
}

export function createLoginRedirect(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/login', request.url));
}

export function handleAuthMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // If it's a public route, allow access
  if (isPublicRoute(pathname)) {
    return null; // Allow access
  }
  
  // If it's not a protected route, allow access (default to public)
  if (!isProtectedRoute(pathname)) {
    return null; // Allow access
  }

  // Get the JWT token
  const token = getAuthToken(request);

  // If no token is present, redirect to login
  if (!token) {
    console.log('No token found, redirecting to login for path:', pathname);
    return createLoginRedirect(request);
  }

  // Do not verify token in middleware (Edge Runtime restriction)
  // Token is present, allow access
  return null; // Allow access
} 