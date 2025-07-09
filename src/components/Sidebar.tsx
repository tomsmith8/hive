"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  Settings, 
  LogOut, 
  Github,
  Menu,
  CheckSquare,
  Map
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { NavUser } from "./NavUser";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    github?: {
      username?: string;
      publicRepos?: number;
      followers?: number;
    };
  };
}

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
  { icon: Map, label: "Roadmap", href: "/dashboard/roadmap" },
  { icon: Github, label: "Code Graph", href: "/dashboard/code-graph" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [workspacesRefreshTrigger, setWorkspacesRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  const handleWorkspaceChange = (workspace: any) => {
    console.log("Workspace changed to:", workspace);
    // TODO: Implement workspace switching logic
  };

  const handleCreateWorkspace = () => {
    setCreateDialogOpen(true);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Workspace Switcher */}
      <WorkspaceSwitcher
        onWorkspaceChange={handleWorkspaceChange}
        onCreateWorkspace={handleCreateWorkspace}
        refreshTrigger={workspacesRefreshTrigger}
      />
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => {
          setCreateDialogOpen(false);
          setWorkspacesRefreshTrigger((prev) => prev + 1); // Trigger refresh without remounting
        }}
      />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigate(item.href)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <Separator />

      {/* User Popover */}
      <div className="p-4">
        <NavUser user={{
          name: user.name || "User",
          email: user.email || "",
          avatar: user.image || "",
        }} />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 md:z-50">
        <div className="flex flex-col flex-grow bg-sidebar border-sidebar-border border-r">
          <SidebarContent />
        </div>
      </div>
    </>
  );
} 