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
import { useEffect, useState, useCallback, useRef } from "react";
import type { WorkspaceResponse } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  workspaces?: WorkspaceResponse[]; // unused, for legacy
  activeWorkspace?: WorkspaceResponse;
  onWorkspaceChange?: (workspace: WorkspaceResponse) => void;
  onCreateWorkspace?: () => void;
  onWorkspacesLoaded?: (workspaces: WorkspaceResponse[]) => void;
  refreshTrigger?: number; // New prop to trigger refresh without remounting
}

export function WorkspaceSwitcher({
  workspaces: _unused,
  activeWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
  onWorkspacesLoaded,
  refreshTrigger = 0,
}: WorkspaceSwitcherProps) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeWorkspaceState, setActiveWorkspaceState] = useState<WorkspaceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the callback to prevent it from changing on every render
  const onWorkspacesLoadedRef = useRef(onWorkspacesLoaded);
  onWorkspacesLoadedRef.current = onWorkspacesLoaded;

  // Fetch workspaces for the current user
  const fetchWorkspaces = useCallback(async () => {
    if (status !== "authenticated") return;
    
    // Cancel previous request if still in flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/workspaces", {
        signal: abortControllerRef.current.signal
      });
      const data = await res.json();
      
      setWorkspaces(data.workspaces || []);
      if (data.workspaces && data.workspaces.length > 0) {
        setActiveWorkspaceState(activeWorkspace || data.workspaces[0]);
      } else {
        setActiveWorkspaceState(null);
      }
      onWorkspacesLoadedRef.current?.(data.workspaces || []);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError("Failed to load workspaces");
      }
    } finally {
      setLoading(false);
    }
  }, [status, activeWorkspace]);

  // Initial fetch on authentication
  useEffect(() => {
    if (status === "authenticated" && !initialFetchDone.current) {
      fetchWorkspaces();
      initialFetchDone.current = true;
    }
  }, [status, fetchWorkspaces]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && initialFetchDone.current) {
      fetchWorkspaces();
    }
  }, [refreshTrigger, fetchWorkspaces]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleWorkspaceSelect = (workspace: WorkspaceResponse) => {
    setActiveWorkspaceState(workspace);
    onWorkspaceChange?.(workspace);
  };

  const handleCreateWorkspace = () => {
    onCreateWorkspace?.();
  };

  if (status === "loading" || (status === "authenticated" && !initialFetchDone.current)) {
    return (
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted animate-pulse">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-left flex-1">
            <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
            <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
          </div>
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-30" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 p-3 border rounded-lg border-destructive/20">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
            <Building2 className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium text-sm text-destructive">Error</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workspaces.length) {
    return (
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 p-3 border rounded-lg border-muted">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-left flex-1">
            <div className="font-medium text-sm text-muted-foreground">No workspaces</div>
            <button 
              className="text-xs text-primary hover:underline" 
              onClick={handleCreateWorkspace}
            >
              Create one
            </button>
          </div>
        </div>
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
            className="w-full justify-between h-auto p-3 hover:bg-accent transition-colors"
            disabled={loading}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
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