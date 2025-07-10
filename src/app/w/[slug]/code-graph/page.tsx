import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { CodeGraphWizard } from "@/components/CodeGraphWizard";

export default async function CodeGraphPage() {
  const session = await getServerSession(authOptions);

  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
    github: (session?.user as { github?: { username?: string; publicRepos?: number; followers?: number } })?.github,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Code Graph</h1>
        <p className="text-muted-foreground mt-2">
          Visualize and analyze your repository relationships and dependencies.
        </p>
      </div>

      {/* Onboarding Wizard */}
      <CodeGraphWizard user={user} />
    </div>
  );
} 