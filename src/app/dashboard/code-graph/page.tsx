import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart3, Github, Code, TrendingUp } from "lucide-react";

export default async function CodeGraphPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Code Graph</h1>
          <p className="text-gray-600 mt-2">
            Visualize and analyze your repository relationships and dependencies.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Repository Analysis
            </CardTitle>
            <CardDescription>
              Advanced code graph visualization coming soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Code Graph Analysis</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're building powerful tools to help you understand your codebase relationships, 
                dependencies, and collaboration patterns across your repositories.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Github className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Repository Mapping</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Visualize connections between your repositories
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Dependency Analysis</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Track dependencies and their relationships
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Collaboration Insights</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Understand team collaboration patterns
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 