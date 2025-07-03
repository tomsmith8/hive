'use client';

import { SphinxLogin } from '@/components/auth/SphinxLogin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if we're in development mode
    setIsDev(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const enableDevBypass = () => {
    localStorage.setItem('dev_auth_bypass', 'true');
    localStorage.setItem('jwt_token', 'dev-jwt-token');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Hive</h1>
          <p className="text-muted-foreground mt-2">
            AI Native Product Development
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Choose your authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SphinxLogin />
            
            {/* Test User Login - Show in development or localhost */}
            {isDev && (
              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    🧪 Test User Login
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={enableDevBypass}
                    className="w-full bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                  >
                    🚀 Quick Test Login
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Login as test user for development
                  </p>
                </div>
              </div>
            )}

            {/* Debug info in development */}
            {isDev && (
              <div className="pt-2 text-xs text-gray-400">
                <p>Debug: NODE_ENV = {process.env.NODE_ENV || 'undefined'}</p>
                <p>Debug: Hostname = {typeof window !== 'undefined' ? window.location.hostname : 'server'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 