import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    
    console.log('Middleware running for:', req.nextUrl.pathname);
    console.log('Token exists:', !!token);
    console.log('Token sub:', token?.sub);
    
    // Only check for workspaces on dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (token?.sub) {
        console.log('Dashboard route accessed by authenticated user');
        // For now, let the page handle the workspace check
        // We'll move this logic to the page level temporarily
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Auth callback - path:', req.nextUrl.pathname, 'token:', !!token);
        
        // Allow access to onboarding routes without full auth
        if (req.nextUrl.pathname.startsWith('/onboarding')) {
          return !!token;
        }
        
        // Require auth for dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*'
  ]
}; 