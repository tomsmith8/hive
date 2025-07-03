import { NextRequest, NextResponse } from 'next/server';

export type MiddlewareFunction = (request: NextRequest) => NextResponse | null;

export function composeMiddleware(...middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return function composedMiddleware(request: NextRequest): NextResponse | null {
    for (const middleware of middlewares) {
      const result = middleware(request);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
}

export function createMiddlewareChain(middlewares: MiddlewareFunction[]): MiddlewareFunction {
  return composeMiddleware(...middlewares);
} 