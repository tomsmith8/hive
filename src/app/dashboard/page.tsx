import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Github, Calendar, Activity, Code, BarChart3, Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const user = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
    github: (session.user as { github?: { publicRepos?: number } })?.github,
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s an overview of your development activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GitHub Repos</CardTitle>
              <Github className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(session.user as { github?: { publicRepos?: number } })?.github?.publicRepos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Public repositories
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Active
              </div>
              <p className="text-xs text-muted-foreground">
                Connected via GitHub
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                    <span className="text-sm font-medium">View Code Graph</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Analyze your repositories</p>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Settings</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Manage your preferences</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest development activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Connected to GitHub</div>
                    <div className="text-xs text-muted-foreground">Account successfully linked</div>
                  </div>
                </div>
                {(session.user as { github?: { publicRepos?: number } })?.github && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Profile Synced</div>
                      <div className="text-xs text-muted-foreground">
                        {(session.user as { github?: { publicRepos?: number } }).github?.publicRepos} repositories available
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 