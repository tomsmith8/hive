import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RoadmapContent } from "@/components/roadmap/RoadmapContent";

export default async function RoadmapPage() {
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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Roadmap</h1>
            <p className="text-muted-foreground mt-2">
              Plan and track your product features and development roadmap.
            </p>
          </div>
        </div>

        <RoadmapContent />
      </div>
    </DashboardLayout>
  );
} 