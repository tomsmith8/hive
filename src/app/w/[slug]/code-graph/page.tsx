"use client";

import { CodeGraphWizard } from "@/components/CodeGraphWizard";
import { useSession } from "next-auth/react";

export default function CodeGraphPage() {
  // Get user info from session
  const { data: session } = useSession();
  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
    github: (session?.user as { github?: { username?: string; publicRepos?: number; followers?: number } })?.github,
  };

  // Optionally, you can use workspace context if needed
  // const { workspace } = useWorkspace();

  return <CodeGraphWizard user={user} />;
} 