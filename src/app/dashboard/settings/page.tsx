import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Settings, Shield, Bell, Globe } from "lucide-react";

export default async function SettingsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your account preferences and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">
                  Not enabled
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Connected Accounts</div>
                <div className="text-sm text-gray-500">
                  GitHub OAuth
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Last Login</div>
                <div className="text-sm text-gray-500">
                  Recently
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">
                  Enabled
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Push Notifications</div>
                <div className="text-sm text-gray-500">
                  Disabled
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Security Alerts</div>
                <div className="text-sm text-gray-500">
                  Enabled
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Language</div>
                <div className="text-sm text-gray-500">
                  English
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Timezone</div>
                <div className="text-sm text-gray-500">
                  UTC
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Theme</div>
                <div className="text-sm text-gray-500">
                  Light
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account
              </CardTitle>
              <CardDescription>
                Account management options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Account Status</div>
                <div className="text-sm text-gray-500">
                  Active
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Member Since</div>
                <div className="text-sm text-gray-500">
                  Recently
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Data Export</div>
                <div className="text-sm text-gray-500">
                  Available
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 