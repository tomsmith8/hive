"use client";

import { Badge } from "@/components/ui/badge";
import { Users, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { TaskData } from "@/hooks/useWorkspaceTasks";

interface TaskCardProps {
  task: TaskData;
  workspaceSlug: string;
}

export function TaskCard({ task, workspaceSlug }: TaskCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/w/${workspaceSlug}/task/${task.id}`);
  };

  const getStatusVariant = (status: TaskData["workflowStatus"]) => {
    switch (status) {
      case "DONE":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: TaskData["workflowStatus"]) => {
    switch (status) {
      case "TODO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div
      className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium line-clamp-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(task.workflowStatus)}>
            {getStatusLabel(task.workflowStatus)}
          </Badge>
        </div>
      </div>
      
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
  );
}