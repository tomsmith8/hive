// Export all middleware functions
export { handleAuthMiddleware } from './auth';
export { createRateLimitMiddleware } from './rateLimit';
export { createLoggingMiddleware, logResponse } from './logging';
export { composeMiddleware, createMiddlewareChain, type MiddlewareFunction } from './composer';

// Re-export auth utilities for convenience
export { 
  isProtectedRoute, 
  isPublicRoute, 
  getAuthToken, 
  verifyAuthToken 
} from './auth'; 