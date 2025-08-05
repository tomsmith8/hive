"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  repository?: {
    id: string;
    name: string;
    repositoryUrl: string;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface UseWorkspaceTasksResult {
  tasks: TaskData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWorkspaceTasks(workspaceId: string | null): UseWorkspaceTasksResult {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!workspaceId || !session?.user) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks?workspaceId=${workspaceId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        // Get latest 5 tasks (API already orders by createdAt desc)
        const recentTasks = result.data.slice(0, 5);
        setTasks(recentTasks);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tasks";
      setError(errorMessage);
      console.error("Error fetching workspace tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, session?.user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  };
}