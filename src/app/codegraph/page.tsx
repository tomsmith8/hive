"use client"

import { ProtectedPageTemplate } from "@/components/templates/ProtectedPageTemplate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { useAuth } from "@/providers/AuthProvider"
import { useState } from "react"

interface OnboardingData {
  githubToken: string
  selectedOrganizations: string[]
  selectedRepositories: string[]
}

interface Repository {
  id: string
  name: string
  full_name: string
  status: "pending" | "analyzing" | "analyzed" | "failed"
  language?: string
  updated_at: string
}

export default function CodeGraphPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleOnboardingComplete = (data: OnboardingData) => {
    setShowOnboarding(false)
    // Here you would typically start the analysis process
    console.log('Onboarding completed:', data)
  }

  // Mock data for demonstration
  const mockRepositories: Repository[] = [
    {
      id: '1',
      name: 'hive-platform',
      full_name: 'user/hive-platform',
      status: 'analyzed',
      language: 'TypeScript',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'api-gateway',
      full_name: 'user/api-gateway',
      status: 'analyzing',
      language: 'Go',
      updated_at: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      name: 'frontend-app',
      full_name: 'user/frontend-app',
      status: 'pending',
      language: 'JavaScript',
      updated_at: '2024-01-13T09:20:00Z'
    }
  ]

  const getStatusColor = (status: Repository['status']) => {
    switch (status) {
      case 'analyzed':
        return 'bg-green-100 text-green-800'
      case 'analyzing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Repository['status']) => {
    switch (status) {
      case 'analyzed':
        return 'Analyzed'
      case 'analyzing':
        return 'Analyzing'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated && !authLoading) {
    return null
  }

  if (showOnboarding) {
    return (
      <ProtectedPageTemplate pageName="Code Graph Setup">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </ProtectedPageTemplate>
    )
  }

  return (
    <ProtectedPageTemplate pageName="Code Graph">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Code Graph</h1>
            <p className="text-muted-foreground">
              Analyze your codebase and discover insights about your project&apos;s architecture and dependencies.
            </p>
          </div>
          <Button onClick={() => setShowOnboarding(true)}>
            Add Repository
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockRepositories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRepositories.filter((r: Repository) => r.status === "analyzed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyzing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRepositories.filter((r: Repository) => r.status === "analyzing").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockRepositories.filter((r: Repository) => r.status === "pending").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repositories List */}
        <Card>
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>
              Your connected repositories and their analysis status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRepositories.map((repo: Repository) => (
                <div key={repo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{repo.name}</h3>
                      <p className="text-sm text-muted-foreground">{repo.full_name}</p>
                    </div>
                    <Badge className={getStatusColor(repo.status)}>
                      {getStatusText(repo.status)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {repo.language && (
                      <p className="text-sm text-muted-foreground">{repo.language}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedPageTemplate>
  )
} 