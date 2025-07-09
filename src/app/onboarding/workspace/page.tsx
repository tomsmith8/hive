import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { OnboardingWorkspaceClient } from "@/app/onboarding/workspace/client";

export default async function OnboardingWorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const user = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
    id: (session.user as { id: string }).id,
    github: (session.user as { github?: { username?: string; publicRepos?: number; followers?: number } })?.github,
  };

  return <OnboardingWorkspaceClient user={user} />;
} 