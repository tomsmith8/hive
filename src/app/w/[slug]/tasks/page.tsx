"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Plus, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWorkspaceTasks } from "@/hooks/useWorkspaceTasks";
import { ConnectRepository } from "@/components/ConnectRepository";

export default function TasksPage() {
  const router = useRouter();
  const { workspace, slug, id: workspaceId } = useWorkspace();
  const { tasks, loading, error } = useWorkspaceTasks(workspaceId);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your development tasks and issues.
          </p>
        </div>
        {workspace?.isCodeGraphSetup && (
          <Button onClick={() => router.push(`/w/${slug}/task/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        )}
      </div>

      {/* Connect Repository Card - Only show if CodeGraph is not set up */}
      {workspace && !workspace.isCodeGraphSetup ? (
        <ConnectRepository
          workspaceSlug={slug}
          title="Connect repository to Start Managing Tasks"
          description="Setup your development environment to ask codebase questions or write code."
          buttonText="Connect Repository"
        />
      ) : (
        <>
          {/* Recent Tasks */}
          {loading ? (
            <Card>
              <CardHeader>
                <CardTitle>Loading tasks...</CardTitle>
              </CardHeader>
            </Card>
          ) : error ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error loading tasks</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          ) : tasks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  No tasks created yet
                </CardTitle>
                <CardDescription>
                  Create your first task to start tracking work in this workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/w/${slug}/task/new`)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Tasks
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
                <CardDescription>
                  Your latest tasks in this workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => router.push(`/w/${slug}/task/${task.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            task.status === "DONE" ? "default" :
                            task.status === "IN_PROGRESS" ? "secondary" :
                            "outline"
                          }
                        >
                          {task.status === "TODO" ? "To Do" :
                           task.status === "IN_PROGRESS" ? "In Progress" :
                           task.status === "DONE" ? "Done" :
                           "Cancelled"}
                        </Badge>
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{task.assignee.name || task.assignee.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
