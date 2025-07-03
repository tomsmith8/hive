# Next.js Development Rules

## App Router Structure
- Use the app directory for all pages
- Follow the file-based routing convention
- Use `page.tsx` for route pages
- Use `layout.tsx` for shared layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries

## Server vs Client Components
- Default to server components
- Use 'use client' directive only when necessary
- Keep client components as small as possible
- Use server components for data fetching
- Use client components for interactivity

## Data Fetching
- Use server components for initial data fetching
- Implement proper loading states
- Handle errors gracefully
- Use SWR or React Query for client-side data
- Cache data appropriately

## API Routes
- Place API routes in `src/app/api/`
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Implement proper error handling
- Return consistent response formats
- Use middleware for authentication/authorization

## Performance
- Use Next.js Image component for images
- Implement proper caching strategies
- Use dynamic imports for code splitting
- Optimize bundle size
- Use Next.js built-in optimizations

## Example Page Structure:
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
```

## Example API Route:
```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
``` 