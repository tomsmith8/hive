import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Github, CheckCircle, AlertCircle } from 'lucide-react';

interface GitHubUser {
  login: string;
}

interface GitHubConnectionStepProps {
  onConnected: (token: string, user: GitHubUser) => void;
  onError: (error: string) => void;
}

export function GitHubConnectionStep({ onConnected, onError }: GitHubConnectionStepProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);

  // Check if user already has GitHub connected
  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const response = await fetch('/api/user/github');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        setUser({ login: data.githubUsername });
      }
    } catch {
      // User not connected, that's fine
    }
  };

  const handleGitHubConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Redirect to our API route which will handle the OAuth flow
      window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('GitHub connection error:', error);
      onError('Failed to initiate GitHub connection');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Github className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Connect to GitHub</h3>
          <p className="text-muted-foreground">
            Connect your GitHub account to analyze your repositories and organizations.
          </p>
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What we&apos;ll access:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Your public and private repositories</li>
                  <li>• Organizations you have access to</li>
                  <li>• Repository metadata and structure</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGitHubConnect}
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            <Github className="mr-2 h-5 w-5" />
            {isConnecting ? 'Connecting...' : 'Connect with GitHub'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Connected to GitHub</p>
                {user && (
                  <p className="text-sm text-green-700">
                    Connected as {user.login}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="flex-1"
            >
              Disconnect
            </Button>
            <Button
              onClick={() => onConnected('token', user!)}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 