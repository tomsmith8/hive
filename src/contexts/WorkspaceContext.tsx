'use client';

import React, { createContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import type { WorkspaceWithAccess, WorkspaceWithRole, WorkspaceRole } from '@/types/workspace';

// Context shape as specified in the requirements
interface WorkspaceContextType {
  // Current workspace data
  workspace: WorkspaceWithAccess | null;
  slug: string;
  id: string;
  role: WorkspaceRole | null;
  
  // Available workspaces
  workspaces: WorkspaceWithRole[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Actions
  switchWorkspace: (workspace: WorkspaceWithRole) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshCurrentWorkspace: () => Promise<void>;
  
  // Helper methods
  hasAccess: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
  initialSlug?: string; // Allow setting initial workspace from URL or props
}

export function WorkspaceProvider({ children, initialSlug }: WorkspaceProviderProps) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // State management
  const [workspace, setWorkspace] = useState<WorkspaceWithAccess | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract current slug from pathname or use initialSlug
  const getCurrentSlug = useCallback(() => {
    // Extract slug from pathname like "/w/[slug]" or "/w/[slug]/tasks"
    const matches = pathname.match(/^\/w\/([^\/]+)/);
    return matches?.[1] || initialSlug || '';
  }, [pathname, initialSlug]);

  // Fetch user's workspaces
  const fetchWorkspaces = useCallback(async (): Promise<WorkspaceWithRole[]> => {
    if (status !== 'authenticated') return [];
    
    try {
      const response = await fetch('/api/workspaces');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch workspaces');
      }
      
      return data.workspaces || [];
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
      throw err;
    }
  }, [status]);

  // Fetch specific workspace by slug
  const fetchWorkspaceBySlug = useCallback(async (slug: string): Promise<WorkspaceWithAccess | null> => {
    if (!slug || status !== 'authenticated') return null;
    
    try {
      const response = await fetch(`/api/workspaces/${slug}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          return null; // User doesn't have access or workspace doesn't exist
        }
        throw new Error(data.error || 'Failed to fetch workspace');
      }
      
      return data.workspace;
    } catch (err) {
      console.error(`Failed to fetch workspace ${slug}:`, err);
      throw err;
    }
  }, [status]);

  // Refresh workspaces list
  const refreshWorkspaces = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedWorkspaces = await fetchWorkspaces();
      setWorkspaces(fetchedWorkspaces);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, [fetchWorkspaces, status]);

  // Refresh current workspace
  const refreshCurrentWorkspace = useCallback(async () => {
    const currentSlug = getCurrentSlug();
    if (!currentSlug || status !== 'authenticated') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedWorkspace = await fetchWorkspaceBySlug(currentSlug);
      setWorkspace(fetchedWorkspace);
      
      if (!fetchedWorkspace) {
        setError('Workspace not found or access denied');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace');
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [getCurrentSlug, fetchWorkspaceBySlug, status]);

  // Switch to a different workspace
  const switchWorkspace = useCallback((targetWorkspace: WorkspaceWithRole) => {
    // Update URL to reflect the new workspace
    const currentPath = pathname.replace(/^\/w\/[^\/]+/, '') || '';
    const newPath = `/w/${targetWorkspace.slug}${currentPath}`;
    
    router.push(newPath);
  }, [router, pathname]);

  // Initialize context when authentication status changes
  useEffect(() => {
    if (status === 'authenticated') {
      refreshWorkspaces();
    } else if (status === 'unauthenticated') {
      // Reset state when user logs out
      setWorkspace(null);
      setWorkspaces([]);
      setError(null);
    }
  }, [status, refreshWorkspaces]);

  // Load current workspace when slug changes
  useEffect(() => {
    const currentSlug = getCurrentSlug();
    if (currentSlug && status === 'authenticated') {
      refreshCurrentWorkspace();
    } else if (!currentSlug && status === 'authenticated') {
      // No slug in URL, try to redirect to user's default workspace
      if (workspaces.length > 0) {
        const defaultWorkspace = workspaces[0]; // First workspace as default
        switchWorkspace(defaultWorkspace);
      }
    }
  }, [getCurrentSlug, status, refreshCurrentWorkspace, workspaces, switchWorkspace]);

  // Computed values
  const slug = workspace?.slug || '';
  const id = workspace?.id || '';
  const role = workspace?.userRole || null;
  const hasAccess = !!workspace;
  
  // Note: Permission checks have been moved to useWorkspaceAccess hook

  const contextValue: WorkspaceContextType = {
    // Current workspace data
    workspace,
    slug,
    id,
    role,
    
    // Available workspaces
    workspaces,
    
    // Loading and error states
    loading,
    error,
    
    // Actions
    switchWorkspace,
    refreshWorkspaces,
    refreshCurrentWorkspace,
    
    // Helper methods
    hasAccess,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Note: useWorkspace hook has been moved to src/hooks/useWorkspace.ts

// Export the context for advanced usage
export { WorkspaceContext }; 