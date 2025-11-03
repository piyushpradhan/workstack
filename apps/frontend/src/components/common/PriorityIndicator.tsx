import type { TaskPriority } from "@/state/tasks/types";
import { AlertCircle } from "lucide-react";

interface PriorityIndicatorProps {
  priority: TaskPriority;
  showLabel?: boolean;
}

const priorityConfig = {
  LOW: { label: "Low", color: "muted", icon: "○" },
  MEDIUM: { label: "Medium", color: "blue", icon: "◐" },
  HIGH: { label: "High", color: "orange", icon: "●" },
  URGENT: { label: "Urgent", color: "destructive", icon: "⬤" },
};

export function PriorityIndicator({
  priority,
  showLabel = false,
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority];

  return (
    <div className="flex items-center gap-2">
      {priority === "URGENT" ? (
        <AlertCircle className={`w-4 h-4 text-${config.color}`} />
      ) : (
        <span className={`text-${config.color}`}>{config.icon}</span>
      )}
      {showLabel && (
        <span className="text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
