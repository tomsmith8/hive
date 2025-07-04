import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Mail, Github, Calendar } from "lucide-react";

export default async function ProfilePage() {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <div className="text-lg font-semibold">{session.user?.name}</div>
                  <div className="text-sm text-gray-500">{session.user?.email}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">User ID</div>
                <div className="text-sm text-gray-500 font-mono">
                  {(session.user as any)?.id || "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                GitHub Connection
              </CardTitle>
              <CardDescription>
                Your GitHub account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(session.user as any)?.github ? (
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Username</div>
                    <div className="text-sm text-gray-500">
                      @{(session.user as any).github.username}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Public Repositories</div>
                    <div className="text-sm text-gray-500">
                      {(session.user as any).github.publicRepos}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Followers</div>
                    <div className="text-sm text-gray-500">
                      {(session.user as any).github.followers}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  No GitHub account connected
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 