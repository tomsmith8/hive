'use client';

import { SphinxLogin } from '@/components/auth/SphinxLogin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
            AI-first product management platform
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
            
            {/* Development Bypass - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Development Mode
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={enableDevBypass}
                    className="w-full"
                  >
                    🚀 Quick Dev Login
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Bypass authentication for development
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 