"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2, Zap, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Workspace {
  id: string;
  name: string;
  logo: React.ElementType;
  type: string;
}

interface WorkspaceSwitcherProps {
  workspaces?: Workspace[];
  activeWorkspace?: Workspace;
  onWorkspaceChange?: (workspace: Workspace) => void;
  onCreateWorkspace?: () => void;
}

// Mock workspaces data
const defaultWorkspaces: Workspace[] = [
  {
    id: "1",
    name: "Stakwork",
    logo: Building2,
    type: "Enterprise",
  },
  {
    id: "2", 
    name: "Sphinx Apps",
    logo: Zap,
    type: "Development",
  },
  {
    id: "3",
    name: "Hive",
    logo: Layers,
    type: "Personal",
  },
];

export function WorkspaceSwitcher({
  workspaces = defaultWorkspaces,
  activeWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
}: WorkspaceSwitcherProps) {
  const [activeWorkspaceState, setActiveWorkspaceState] = React.useState(
    activeWorkspace || workspaces[0]
  );

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    onWorkspaceChange?.(workspace);
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace?.();
  };

  if (!activeWorkspaceState) {
    return null;
  }

  return (
    <div className="p-4 border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto p-3 hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <activeWorkspaceState.logo className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{activeWorkspaceState.name}</div>
                <div className="text-xs text-muted-foreground">{activeWorkspaceState.type}</div>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((workspace, index) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceSelect(workspace)}
              className="flex items-center gap-2 p-2"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted">
                <workspace.logo className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{workspace.name}</div>
                <div className="text-xs text-muted-foreground">{workspace.type}</div>
              </div>
              {activeWorkspaceState.id === workspace.id && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
              <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCreateWorkspace}
            className="flex items-center gap-2 p-2"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-md border border-dashed">
              <Plus className="w-4 h-4" />
            </div>
            <div className="font-medium text-sm text-muted-foreground">
              Create new workspace
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 