import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Github, Calendar, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const user = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
    github: (session.user as any)?.github,
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name || "User"}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GitHub Repos</CardTitle>
              <Github className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(session.user as any)?.github?.publicRepos || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(session.user as any)?.github?.followers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Type</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {session.user?.email ? "Verified" : "Unverified"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User ID</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono text-muted-foreground">
                {(session.user as any)?.id?.slice(0, 8) || "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your account details from GitHub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold">{session.user?.name}</div>
                  <div className="text-sm text-gray-500">{session.user?.email}</div>
                </div>
              </div>
              
              {(session.user as any)?.github && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    <span className="text-sm">
                      @{(session.user as any).github.username}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {(session.user as any).github.publicRepos} repos
                    </Badge>
                    <Badge variant="secondary">
                      {(session.user as any).github.followers} followers
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Session Details
              </CardTitle>
              <CardDescription>
                Authentication information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">User ID</div>
                <div className="text-sm text-gray-500 font-mono">
                  {(session.user as any)?.id || "N/A"}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Provider</div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span className="text-sm">GitHub OAuth</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Email Verified</div>
                <div className="text-sm text-gray-500">
                  {session.user?.email ? "Yes" : "No"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 