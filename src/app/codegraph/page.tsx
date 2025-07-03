"use client"

import { useState } from "react"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  GitBranch, 
  Code2, 
  Users, 
  Activity, 
  BarChart3, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Github
} from "lucide-react"

export default function CodeGraphPage() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState("idle")

  const handleOnboardingComplete = (data: any) => {
    setOnboardingData(data)
    setIsOnboardingComplete(true)
    // Start analysis automatically
    startAnalysis()
  }

  const startAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisStatus("running")
    
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisStatus("completed")
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "analyzed": return "bg-green-100 text-green-800"
      case "analyzing": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  // Mock data based on onboarding selection
  const mockRepositories = onboardingData?.selectedRepositories?.map((repo: string) => ({
    name: repo.split('/').pop() || repo,
    url: `https://github.com/${repo}`,
    status: "analyzed",
    lastUpdate: "2 hours ago"
  })) || []

  const mockMetrics = {
    totalFiles: 1247,
    totalLines: 45678,
    languages: ["TypeScript", "JavaScript", "Python", "Go"],
    contributors: 8,
    complexity: "Medium",
    coverage: "78%"
  }

  if (!isOnboardingComplete) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Code Graph</h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your code analysis workspace
          </p>
        </div>
        
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Graph</h1>
          <p className="text-muted-foreground">
            Analyze and visualize your codebase structure and dependencies.
          </p>
          {onboardingData && (
            <div className="flex items-center gap-2 mt-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Connected to GitHub • {onboardingData.selectedOrganizations.length} organizations • {onboardingData.selectedRepositories.length} repositories
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button
            onClick={startAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? "Analyzing..." : "Start Analysis"}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Analysis Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockRepositories.filter((r: any) => r.status === "analyzed").length}
              </div>
              <div className="text-sm text-muted-foreground">Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockRepositories.filter((r: any) => r.status === "analyzing").length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockRepositories.filter((r: any) => r.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repositories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Connected Repositories
          </CardTitle>
          <CardDescription>
            Repositories being analyzed for code graph generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRepositories.length > 0 ? (
              mockRepositories.map((repo: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{repo.name}</div>
                      <div className="text-sm text-muted-foreground">{repo.url}</div>
                      <div className="text-xs text-muted-foreground">Last updated: {repo.lastUpdate}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(repo.status)}>
                    {repo.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No repositories selected for analysis.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Code Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Files:</span>
                <span className="font-medium">{mockMetrics.totalFiles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Lines:</span>
                <span className="font-medium">{mockMetrics.totalLines.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Languages:</span>
                <span className="font-medium">{mockMetrics.languages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Contributors:</span>
                <span className="font-medium">{mockMetrics.contributors}</span>
              </div>
              <div className="flex justify-between">
                <span>Complexity:</span>
                <span className="font-medium">{mockMetrics.complexity}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage:</span>
                <span className="font-medium">{mockMetrics.coverage}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Active Contributors</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recent Commits</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pull Requests</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Issues</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 