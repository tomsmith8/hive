import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/tasks',
  '/kanban',
  '/codegraph',
  '/settings',
]



export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get the JWT token from cookies or headers
  const token = request.cookies.get('jwt_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  // If no token is present, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify the token
  try {
    const user = verifyJWT(token)
    if (!user) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Token is valid, allow access
    return NextResponse.next()
  } catch {
    // Token verification failed, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
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