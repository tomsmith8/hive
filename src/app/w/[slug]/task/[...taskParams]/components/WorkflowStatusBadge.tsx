import { WorkflowStatus } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Pause, 
  AlertCircle,
  Loader2 
} from "lucide-react";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus | null | undefined;
  className?: string;
}

const statusConfig = {
  [WorkflowStatus.PENDING]: {
    label: "Pending",
    icon: Clock,
    className: "text-muted-foreground",
  },
  [WorkflowStatus.IN_PROGRESS]: {
    label: "Running",
    icon: Loader2,
    className: "text-blue-600",
    iconClassName: "animate-spin",
  },
  [WorkflowStatus.COMPLETED]: {
    label: "Completed",
    icon: CheckCircle,
    className: "text-green-600",
  },
  [WorkflowStatus.ERROR]: {
    label: "Error",
    icon: AlertCircle,
    className: "text-red-600",
  },
  [WorkflowStatus.HALTED]: {
    label: "Halted",
    icon: Pause,
    className: "text-orange-600",
  },
  [WorkflowStatus.FAILED]: {
    label: "Failed",
    icon: XCircle,
    className: "text-red-600",
  },
};

export function WorkflowStatusBadge({
  status,
  className,
}: WorkflowStatusBadgeProps) {
  if (!status) {
    return null;
  }

  const config = statusConfig[status];
  if (!config) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-3 w-3", config.iconClassName)} />
      <span>{config.label}</span>
    </div>
  );
}