import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { redirect } from "next/navigation";
import { getUserWorkspaces, getDefaultWorkspaceForUser } from "@/services/workspace";
import { OnboardingWorkspaceClient } from "@/app/onboarding/workspace/client";

export default async function OnboardingWorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userId = (session.user as { id: string }).id;

  // Check if user has any workspaces
  try {
    const userWorkspaces = await getUserWorkspaces(userId);
    
    if (userWorkspaces.length > 0) {
      // User has workspaces, get their default workspace and redirect
      const defaultWorkspace = await getDefaultWorkspaceForUser(userId);
      
      if (defaultWorkspace) {
        // Redirect to the default workspace
        redirect(`/w/${defaultWorkspace.slug}`);
      } else {
        // Fallback to first workspace from the list
        redirect(`/w/${userWorkspaces[0].slug}`);
      }
    }
  } catch (error) {
    console.error('Error checking user workspaces:', error);
    // Continue to show workspace creation form on error
  }

  // User has no workspaces, show the creation form
  const user = {
    name: session.user?.name,
    email: session.user?.email,
    image: session.user?.image,
    id: userId,
    github: (session.user as { github?: { username?: string; publicRepos?: number; followers?: number } })?.github,
  };

  return <OnboardingWorkspaceClient user={user} />;
} 