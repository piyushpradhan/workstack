import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityIndicator } from "@/components/common/PriorityIndicator";
import { Calendar } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/state";

interface TaskPropertiesCardProps {
  status?: TaskStatus;
  onStatusChange: (v: string) => void;
  priority?: TaskPriority;
  onPriorityChange: (v: string) => void;
  dueDate?: string;
  onDueDateChange: (v: string) => void;
  isOverdue: boolean;
  isDueSoon: boolean;
  formatDate: (iso: string) => string;
}

export function TaskPropertiesCard({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  isOverdue,
  isDueSoon,
  formatDate,
}: TaskPropertiesCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3">
      <label className="text-muted-foreground block">Properties</label>
      <div className="space-y-3">
        <div className="space-y-1">
          <span className="text-muted-foreground text-sm">Status</span>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="bg-background border-border text-foreground w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              <SelectItem
                value="TODO"
                className="text-foreground hover:bg-accent"
              >
                <StatusBadge status="TODO" />
              </SelectItem>
              <SelectItem
                value="IN_PROGRESS"
                className="text-foreground hover:bg-accent"
              >
                <StatusBadge status="IN_PROGRESS" />
              </SelectItem>
              <SelectItem
                value="IN_REVIEW"
                className="text-foreground hover:bg-accent"
              >
                <StatusBadge status="IN_REVIEW" />
              </SelectItem>
              <SelectItem
                value="DONE"
                className="text-foreground hover:bg-accent"
              >
                <StatusBadge status="DONE" />
              </SelectItem>
              <SelectItem
                value="CANCELLED"
                className="text-foreground hover:bg-accent"
              >
                <StatusBadge status="CANCELLED" />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span className="text-muted-foreground text-sm">Priority</span>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger className="bg-background border-border text-foreground w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border">
              <SelectItem
                value="LOW"
                className="text-foreground hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <PriorityIndicator priority="LOW" />
                  <span>Low</span>
                </div>
              </SelectItem>
              <SelectItem
                value="MEDIUM"
                className="text-foreground hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <PriorityIndicator priority="MEDIUM" />
                  <span>Medium</span>
                </div>
              </SelectItem>
              <SelectItem
                value="HIGH"
                className="text-foreground hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <PriorityIndicator priority="HIGH" />
                  <span>High</span>
                </div>
              </SelectItem>
              <SelectItem
                value="URGENT"
                className="text-foreground hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <PriorityIndicator priority="URGENT" />
                  <span>Urgent</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Due Date
          </span>
          <input
            type="date"
            value={dueDate ? dueDate.split("T")[0] : ""}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full bg-background border border-border text-foreground rounded-md px-3 py-2 text-sm"
          />
          {dueDate && (
            <p
              className={`text-xs ${isOverdue ? "text-destructive" : isDueSoon ? "text-yellow-500" : "text-muted-foreground"}`}
            >
              {isOverdue
                ? "Overdue"
                : isDueSoon
                  ? "Due soon"
                  : `Due ${formatDate(dueDate)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
