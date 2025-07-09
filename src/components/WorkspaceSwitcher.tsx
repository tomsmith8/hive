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
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { WorkspaceResponse } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  workspaces?: WorkspaceResponse[]; // unused, for legacy
  activeWorkspace?: WorkspaceResponse;
  onWorkspaceChange?: (workspace: WorkspaceResponse) => void;
  onCreateWorkspace?: () => void;
  onWorkspacesLoaded?: (workspaces: WorkspaceResponse[]) => void;
}

export function WorkspaceSwitcher({
  workspaces: _unused,
  activeWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
  onWorkspacesLoaded,
}: WorkspaceSwitcherProps) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkspaceState, setActiveWorkspaceState] = useState<WorkspaceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspaces for the current user
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/workspaces")
      .then(res => res.json())
      .then(data => {
        setWorkspaces(data.workspaces || []);
        if (data.workspaces && data.workspaces.length > 0) {
          setActiveWorkspaceState(activeWorkspace || data.workspaces[0]);
        } else {
          setActiveWorkspaceState(null);
        }
        onWorkspacesLoaded?.(data.workspaces || []);
        setError(null);
      })
      .catch(err => {
        setError("Failed to load workspaces");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleWorkspaceSelect = (workspace: WorkspaceResponse) => {
    setActiveWorkspaceState(workspace);
    onWorkspaceChange?.(workspace);
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace?.();
  };

  if (loading) {
    return (
      <div className="p-4 border-b text-muted-foreground text-sm">Loading workspaces...</div>
    );
  }
  if (error) {
    return (
      <div className="p-4 border-b text-destructive text-sm">{error}</div>
    );
  }
  if (!workspaces.length) {
    return (
      <div className="p-4 border-b text-muted-foreground text-sm">
        No workspaces found. <button className="underline" onClick={handleCreateWorkspace}>Create one</button>.
      </div>
    );
  }
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
                {/* Placeholder icon, can be improved to use a logo field if available */}
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{activeWorkspaceState.name}</div>
                <div className="text-xs text-muted-foreground">Workspace</div>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" side="bottom" sideOffset={8} forceMount>
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
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{workspace.name}</div>
                <div className="text-xs text-muted-foreground">Workspace</div>
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