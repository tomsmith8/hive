"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedPageTemplate } from "@/components/templates/ProtectedPageTemplate"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleDisconnectGitHub = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/github/disconnect', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        console.error('Failed to disconnect GitHub');
      }
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedPageTemplate pageName="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your account and development environment settings.
          </p>
        </div>

        {/* GitHub Integration */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub Integration</CardTitle>
            <CardDescription>
              Manage your GitHub connection and repository access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">GitHub Connected</p>
                <p className="text-sm text-muted-foreground">
                  Your GitHub account is connected and ready for code analysis.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnectGitHub}
                disabled={isLoading}
              >
                {isLoading ? "Disconnecting..." : "Disconnect GitHub"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Account settings will be available in a future update.
            </p>
          </CardContent>
        </Card>

        {/* Development Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Development Settings</CardTitle>
            <CardDescription>
              Configure your development environment and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Development settings will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedPageTemplate>
  );
} 