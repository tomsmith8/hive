"use client"

import { ProtectedPageTemplate } from "@/components/templates/ProtectedPageTemplate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitHubConnectionStep } from "@/components/onboarding/GitHubConnectionStep"
import { useAuth } from "@/providers/AuthProvider"
import { useState, useEffect } from "react"
import { Github, CheckCircle } from "lucide-react"

interface GitHubData {
  githubUsername: string
  githubUserId: string
  githubOrganizations: any
  hasToken: boolean
}

export default function CodeGraphPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [githubData, setGitHubData] = useState<GitHubData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  // Check GitHub connection on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      checkGitHubConnection()
    } else if (!authLoading) {
      setIsLoading(false)
    }
  }, [isAuthenticated, user, authLoading])

  const checkGitHubConnection = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/user/github', { credentials: 'include' })
      
      if (response.ok) {
        const data = await response.json()
        setGitHubData(data)
      } else if (response.status === 404) {
        // GitHub not connected - this is expected, show connect flow
        setGitHubData(null)
        setError(null)
      } else {
        throw new Error('Failed to check GitHub connection')
      }
    } catch (err) {
      console.error('Error checking GitHub connection:', err)
      setError('Failed to check GitHub connection')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubConnected = (token: string, githubUser: any) => {
    // Refresh the GitHub connection data
    checkGitHubConnection()
  }

  const handleGitHubError = (error: string) => {
    setError(error)
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    setError(null)
    try {
      const response = await fetch('/api/user/github/token', {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to disconnect GitHub')
      }
      // Refresh connection state
      await checkGitHubConnection()
    } catch (err) {
      setError('Failed to disconnect GitHub')
    } finally {
      setDisconnecting(false)
    }
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated && !authLoading) {
    return null
  }

  return (
    <ProtectedPageTemplate pageName="Code Graph">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Content */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Checking GitHub connection...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="text-red-500 text-lg">Error</div>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={checkGitHubConnection} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : githubData ? (
          // GitHub is connected
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span>GitHub Connected</span>
              </CardTitle>
              <CardDescription>
                Your GitHub account is connected and ready for code analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Github className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Connected as {githubData.githubUsername}
                    </p>
                    <p className="text-sm text-green-700">
                      User ID: {githubData.githubUserId}
                    </p>
                    {githubData.githubOrganizations && (
                      <p className="text-sm text-green-700">
                        Organizations: {Array.isArray(githubData.githubOrganizations) ? githubData.githubOrganizations.length : 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // GitHub not connected - show connection flow
          <Card>
            <CardHeader>
              <CardTitle>Connect to GitHub</CardTitle>
              <CardDescription>
                Connect your GitHub account to start analyzing your codebase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GitHubConnectionStep 
                onConnected={handleGitHubConnected}
                onError={handleGitHubError}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedPageTemplate>
  )
} 