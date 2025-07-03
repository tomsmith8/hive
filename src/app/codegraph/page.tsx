"use client"

import { useState } from "react"
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
  RefreshCw
} from "lucide-react"

export default function CodeGraphPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState("idle")

  const mockRepositories = [
    { name: "hive-frontend", url: "https://github.com/user/hive-frontend", status: "analyzed", lastUpdate: "2 hours ago" },
    { name: "hive-backend", url: "https://github.com/user/hive-backend", status: "analyzing", lastUpdate: "5 minutes ago" },
    { name: "hive-mobile", url: "https://github.com/user/hive-mobile", status: "pending", lastUpdate: "1 day ago" },
  ]

  const mockMetrics = {
    totalFiles: 1247,
    totalLines: 45678,
    languages: ["TypeScript", "JavaScript", "Python", "Go"],
    contributors: 8,
    complexity: "Medium",
    coverage: "78%"
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Graph</h1>
          <p className="text-muted-foreground">
            Analyze and visualize your codebase structure and dependencies.
          </p>
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
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-muted-foreground">Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">1</div>
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
            {mockRepositories.map((repo, index) => (
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
            ))}
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
                <span className="font-medium">23</span>
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

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
          <CardDescription>
            Check if all required settings are configured for code graph analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Swarm URL</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Swarm API Key</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pool Name</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>GitHub PAT</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Repositories</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">3 Connected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 