'use client';

import { StatsCard } from "@/components/dashboard/StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/providers/AuthProvider"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (!isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.ownerAlias || user?.ownerPubKey.slice(0, 10) + '...'}! Here&apos;s what&apos;s happening with your projects.
            </p>
          </div>
          <Button asChild>
            <Link href="/projects/new">Create Project</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Active Projects"
            value="12"
            description="Projects in progress"
            icon="📁"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Open Tasks"
            value="47"
            description="Tasks to be completed"
            icon="✅"
            trend={{ value: 12, isPositive: false }}
          />
          <StatsCard
            title="Active Bounties"
            value="8"
            description="Bounties available"
            icon="💰"
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Team Velocity"
            value="24"
            description="Story points this sprint"
            icon="📈"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Task completed</p>
                    <p className="text-xs text-muted-foreground">
                      &quot;Implement user authentication&quot; was marked as done
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New bounty created</p>
                    <p className="text-xs text-muted-foreground">
                      &quot;$500 bounty for API optimization&quot;
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">4h ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Project milestone</p>
                    <p className="text-xs text-muted-foreground">
                      &quot;Q1 Release&quot; milestone reached
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tasks/new">
                  <span className="mr-2">➕</span>
                  Create New Task
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/bounties/new">
                  <span className="mr-2">💰</span>
                  Create Bounty
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/roadmap/new">
                  <span className="mr-2">🗺️</span>
                  Add Roadmap Item
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/analytics">
                  <span className="mr-2">📊</span>
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>
              Your active projects and their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">E-commerce Platform</h3>
                  <p className="text-sm text-muted-foreground">
                    15 tasks • 3 bounties • 75% complete
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/projects/1">View</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">Mobile App</h3>
                  <p className="text-sm text-muted-foreground">
                    8 tasks • 1 bounty • 45% complete
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/projects/2">View</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">API Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    12 tasks • 2 bounties • 60% complete
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/projects/3">View</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 