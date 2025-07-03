# Authentication & Route Protection

This document explains how the authentication system works and how to add new protected pages.

## How It Works

The application uses a two-layer authentication system:

1. **Server-side protection** via Next.js middleware (`src/middleware.ts`)
2. **Client-side protection** via React components

### Middleware Architecture

The middleware system is modular and extensible:

```
src/middleware/
├── auth.ts          # Authentication logic
├── rateLimit.ts     # Rate limiting
├── logging.ts       # Request logging
├── composer.ts      # Middleware composition
└── index.ts         # Exports
```

Each middleware module can be enabled/disabled independently.

## Adding New Protected Pages

### Option 1: Using the ProtectedPageTemplate (Recommended)

For new pages, use the `ProtectedPageTemplate` component:

```tsx
// src/app/analytics/page.tsx
"use client";

import { ProtectedPageTemplate } from "@/components/templates/ProtectedPageTemplate";

export default function AnalyticsPage() {
  return (
    <ProtectedPageTemplate pageName="Analytics">
      <div>
        {/* Your page content here */}
        <h2>Analytics Dashboard</h2>
        <p>Your analytics content goes here...</p>
      </div>
    </ProtectedPageTemplate>
  );
}
```

### Option 2: Manual Implementation

If you need more control, implement authentication manually:

```tsx
// src/app/reports/page.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      {/* Your page content here */}
    </div>
  );
}
```

## Step-by-Step Guide

### 1. Add the Route to Middleware

Edit `src/middleware/auth.ts` and add your new route to the `protectedRoutePatterns` array:

```tsx
const protectedRoutePatterns = [
  // Core app routes (protected)
  '/dashboard',
  '/tasks', 
  '/kanban',
  '/codegraph',
  '/settings',
  
  // Add new protected routes here:
  '/analytics',  // ← Add your new route here
  '/reports',
  // '/admin',
  // '/user',
];
```

### 2. Create the Page Component

Create your page file (e.g., `src/app/analytics/page.tsx`) using one of the methods above.

### 3. Add to Navigation (Optional)

If you want the page in the sidebar navigation, edit `src/components/layout/Sidebar.tsx`:

```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Kanban', href: '/kanban', icon: BarChart3 },
  { name: 'Code Graph', href: '/codegraph', icon: FolderOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 }, // ← Add your new page
]
```

## Route Patterns

The middleware supports different types of route protection:

- **Exact routes**: `/dashboard` - protects only `/dashboard`
- **Prefix routes**: `/admin` - protects `/admin`, `/admin/users`, `/admin/settings`, etc.
- **Nested routes**: `/user/profile` - protects `/user/profile` specifically

## Public Routes

Routes that should always be public are defined in the `publicRoutes` array in `src/middleware.ts`:

```tsx
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]
```

## Testing

To test that your new protected page works:

1. Log out of the application
2. Try to access your new page directly (e.g., `http://localhost:3000/analytics`)
3. You should be redirected to `/login`
4. After logging in, you should be able to access the page normally

## Troubleshooting

- **Page not protected**: Make sure the route is added to `protectedRoutePatterns` in middleware
- **Infinite redirect loop**: Check that the route isn't in both `protectedRoutePatterns` and `publicRoutes`
- **Client-side errors**: Ensure you're using the `"use client"` directive for client-side authentication checks 