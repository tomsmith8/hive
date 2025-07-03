# Middleware Architecture

This directory contains the modular middleware system for the Hive application.

## Structure

```
src/middleware/
├── auth.ts          # Authentication and route protection
├── rateLimit.ts     # Rate limiting for API endpoints
├── logging.ts       # Request/response logging
├── composer.ts      # Middleware composition utilities
├── index.ts         # Main exports
└── README.md        # This file
```

## Modules

### `auth.ts`
Handles authentication and route protection:
- Defines protected and public routes
- Verifies JWT tokens
- Redirects unauthenticated users to login
- Exports utility functions for route checking

### `rateLimit.ts`
Provides rate limiting functionality:
- Configurable request limits per IP
- Time-window based limiting
- Automatic cleanup of expired entries
- Returns 429 status for exceeded limits

### `logging.ts`
Handles request and response logging:
- Logs incoming requests with metadata
- Tracks response times
- Can be extended for structured logging

### `composer.ts`
Utilities for combining multiple middleware functions:
- `composeMiddleware()` - Chains middleware functions
- `createMiddlewareChain()` - Creates a middleware chain
- Type definitions for middleware functions

### `index.ts`
Main export file that provides a clean API:
- Re-exports all middleware functions
- Provides convenience exports for auth utilities

## Usage

### Adding New Middleware

1. Create a new file in this directory (e.g., `cors.ts`)
2. Export a function that takes `NextRequest` and returns `NextResponse | null`
3. Add it to the middleware chain in `src/middleware.ts`

Example:
```tsx
// src/middleware/cors.ts
import { NextRequest, NextResponse } from 'next/server';

export function createCorsMiddleware() {
  return function corsMiddleware(request: NextRequest): NextResponse | null {
    // Your CORS logic here
    return null; // Continue to next middleware
  };
}
```

### Modifying the Middleware Chain

Edit `src/middleware.ts` to add/remove/reorder middleware:

```tsx
const middlewareChain = composeMiddleware(
  createLoggingMiddleware(),
  createRateLimitMiddleware({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  createCorsMiddleware(), // Add new middleware here
  handleAuthMiddleware
);
```

### Adding Protected Routes

Edit `src/middleware/auth.ts` and add routes to the `protectedRoutePatterns` array:

```tsx
const protectedRoutePatterns = [
  '/dashboard',
  '/tasks', 
  '/kanban',
  '/codegraph',
  '/settings',
  '/analytics',
  '/newpage', // Add your new route here
];
```

## Benefits

- **Modularity**: Each middleware has a single responsibility
- **Testability**: Individual middleware can be tested in isolation
- **Extensibility**: Easy to add new middleware without modifying existing code
- **Maintainability**: Clear separation of concerns
- **Reusability**: Middleware can be reused across different parts of the app

## Configuration

Each middleware module can be configured independently:

- **Auth**: Configure protected routes in `auth.ts`
- **Rate Limiting**: Configure limits in `rateLimit.ts` or when creating the middleware
- **Logging**: Configure log levels and formats in `logging.ts`

## Testing

To test middleware in isolation:

```tsx
import { handleAuthMiddleware } from '@/middleware/auth';

// Create a mock request
const mockRequest = new NextRequest('http://localhost:3000/dashboard');

// Test the middleware
const result = handleAuthMiddleware(mockRequest);
expect(result).toBeDefined();
``` 