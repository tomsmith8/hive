'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';

interface SphinxLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SphinxLogin({ onSuccess, onError }: SphinxLoginProps) {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [deeplink, setDeeplink] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const MAX_POLL_ATTEMPTS = 100; // 5 minutes with 3-second intervals

  const generateChallenge = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/ask');
      if (!response.ok) {
        throw new Error('Failed to generate authentication challenge');
      }

      const data = await response.json();
      setChallenge(data.challenge);

      // Construct deeplink URL for Sphinx desktop app using the current origin (including port)
      const origin = window.location.origin;
      const deeplinkUrl = `sphinx.chat://?action=auth&host=${encodeURIComponent(origin)}&challenge=${data.challenge}&ts=${data.ts}`;
      setDeeplink(deeplinkUrl);

      // Start polling for authentication status
      startPolling(data.challenge);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const startPolling = useCallback((challengeId: string) => {
    const interval = setInterval(async () => {
      try {
        setPollCount(prev => prev + 1);

        if (pollCount >= MAX_POLL_ATTEMPTS) {
          clearInterval(interval);
          setError('Authentication timeout. Please try again.');
          onError?.('Authentication timeout');
          return;
        }

        const response = await fetch(`/api/auth/poll/${challengeId}`);
        if (!response.ok) {
          throw new Error('Failed to check authentication status');
        }

        const data = await response.json();

        if (data.status === 'success') {
          // Authentication successful
          clearInterval(interval);
          
          // Store JWT token in localStorage and cookie
          localStorage.setItem('jwt_token', data.jwt);
          
          // Set cookie for middleware access
          const expires = new Date();
          expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
          document.cookie = `jwt_token=${data.jwt};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
          
          // Update user state
          setUser({
            id: data.id || '',
            ownerPubKey: data.pubkey,
            ownerAlias: data.owner_alias,
            role: 'USER',
            avatar: data.img,
          });

          onSuccess?.();
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Continue polling despite errors
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  }, [pollCount, onError, onSuccess, setUser]);

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  const handleGetSphinx = () => {
    window.open('https://sphinx.chat', '_blank');
  };

  const handleRetryDeeplink = () => {
    if (deeplink) {
      window.location.href = deeplink;
    }
  };

  // Trigger Sphinx deeplink when both challenge and deeplink are set
  useEffect(() => {
    if (challenge && deeplink) {
      const el = document.createElement('a');
      el.href = deeplink;
      document.body.appendChild(el); // Needed for some browsers
      el.click();
      document.body.removeChild(el);
    }
  }, [challenge, deeplink]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  if (user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            You are logged in as {user.ownerAlias || user.ownerPubKey.slice(0, 10) + '...'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login with Sphinx</CardTitle>
        <CardDescription>
          Securely authenticate using your Sphinx desktop app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {!challenge ? (
          <div className="space-y-4">
            <Button 
              onClick={generateChallenge} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Generating Challenge...' : 'Login with Sphinx'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Don&apos;t have Sphinx?</p>
              <Button 
                variant="outline" 
                onClick={handleGetSphinx}
                className="w-full"
              >
                Get Sphinx App
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Opening Sphinx desktop app...
              </p>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  If Sphinx didn&apos;t open automatically, click the button below:
                </p>
                <Button 
                  onClick={handleRetryDeeplink}
                  variant="outline"
                  className="w-full"
                >
                  Open Sphinx App
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Waiting for authentication... ({pollCount}/{MAX_POLL_ATTEMPTS})
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => {
                stopPolling();
                setChallenge(null);
                setDeeplink(null);
                setPollCount(0);
                setError(null);
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 