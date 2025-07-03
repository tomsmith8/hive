'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const enableDevBypass = () => {
    localStorage.setItem('dev_auth_bypass', 'true');
    localStorage.setItem('jwt_token', 'dev-jwt-token');
    window.location.reload();
  };

  const clearAuth = () => {
    localStorage.removeItem('dev_auth_bypass');
    localStorage.removeItem('jwt_token');
    window.location.reload();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
          <CardDescription>Current authentication status and user information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </div>
          </div>
          
          {user && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">User Info:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Local Storage:</h3>
            <div className="text-sm space-y-1">
              <div><strong>jwt_token:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('jwt_token') || 'Not set') : 'Server-side'}</div>
              <div><strong>dev_auth_bypass:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('dev_auth_bypass') || 'Not set') : 'Server-side'}</div>
            </div>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Environment:</h3>
            <div className="text-sm space-y-1">
              <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
              <div><strong>Hostname:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'server'}</div>
              <div><strong>Is Development:</strong> {
                (process.env.NODE_ENV === 'development' || 
                (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) 
                ? 'Yes' : 'No'
              }</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Actions</CardTitle>
          <CardDescription>Actions for development and testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={enableDevBypass} variant="outline">
              Enable Dev Bypass
            </Button>
            <Button onClick={clearAuth} variant="outline">
              Clear Auth
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Test</CardTitle>
          <CardDescription>Test navigation to protected routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button asChild>
              <a href="/dashboard">Dashboard</a>
            </Button>
            <Button asChild>
              <a href="/kanban">Kanban</a>
            </Button>
            <Button asChild>
              <a href="/settings">Settings</a>
            </Button>
            <Button asChild>
              <a href="/tasks">Tasks</a>
            </Button>
            <Button asChild>
              <a href="/codegraph">Code Graph</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 