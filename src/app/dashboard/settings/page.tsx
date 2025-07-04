import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DisconnectAccount } from "@/components/DisconnectAccount";
import { ThemeSettings } from "@/components/ThemeSettings";
import { Github } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const user = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
    github: (session.user as { github?: { username?: string; publicRepos?: number; followers?: number } })?.github,
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and connected services.
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          <ThemeSettings />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Connected Accounts
              </CardTitle>
              <CardDescription>
                Manage your connected third-party accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DisconnectAccount user={user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 