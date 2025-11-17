import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskPriority, TaskStatus } from "@/state";

interface ProjectLike {
  id: string;
  name: string;
}
interface UserLike {
  id: string;
  name: string;
}

interface TasksFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  projects: ProjectLike[];
  users: UserLike[];
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  selectedStatuses: TaskStatus[];
  setSelectedStatuses: (statuses: TaskStatus[]) => void;
  selectedPriorities: TaskPriority[];
  setSelectedPriorities: (p: TaskPriority[]) => void;
  selectedAssignees: string[];
  setSelectedAssignees: (ids: string[]) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function TasksFilters({
  searchQuery,
  onSearchChange,
  projects,
  users,
  selectedProjects,
  setSelectedProjects,
  selectedStatuses,
  setSelectedStatuses,
  selectedPriorities,
  setSelectedPriorities,
  selectedAssignees,
  setSelectedAssignees,
  hasActiveFilters,
  clearFilters,
}: TasksFiltersProps) {
  const toggleFilter = <T,>(
    value: T,
    selected: T[],
    setSelected: (values: T[]) => void,
  ) => {
    if (selected.includes(value))
      setSelected(selected.filter((v) => v !== value));
    else setSelected([...selected, value]);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
      <div className="relative flex-1 sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="pl-10"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 border-border hover:bg-accent flex-shrink-0 w-full sm:w-auto cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {selectedProjects.length +
                  selectedStatuses.length +
                  selectedPriorities.length +
                  selectedAssignees.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 max-h-[80vh] overflow-y-auto"
        >
          <DropdownMenuLabel>
            Filter by Project
          </DropdownMenuLabel>
          {projects?.map((project) => (
            <DropdownMenuCheckboxItem
              key={project.id}
              checked={selectedProjects.includes(project.id)}
              onCheckedChange={() =>
                toggleFilter(project.id, selectedProjects, setSelectedProjects)
              }
            >
              {project.name}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            Filter by Status
          </DropdownMenuLabel>
          {(
            [
              "TODO",
              "IN_PROGRESS",
              "IN_REVIEW",
              "DONE",
              "CANCELLED",
            ] as TaskStatus[]
          ).map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() =>
                toggleFilter(status, selectedStatuses, setSelectedStatuses)
              }
            >
              {status.replace("_", " ")}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            Filter by Priority
          </DropdownMenuLabel>
          {(["LOW", "MEDIUM", "HIGH", "URGENT"] as TaskPriority[]).map(
            (priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={selectedPriorities.includes(priority)}
                onCheckedChange={() =>
                  toggleFilter(
                    priority,
                    selectedPriorities,
                    setSelectedPriorities,
                  )
                }
              >
                {priority}
              </DropdownMenuCheckboxItem>
            ),
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel>
            Filter by Assignee
          </DropdownMenuLabel>
          {users?.map((user) => (
            <DropdownMenuCheckboxItem
              key={user.id}
              checked={selectedAssignees.includes(user.id)}
              onCheckedChange={() =>
                toggleFilter(user.id, selectedAssignees, setSelectedAssignees)
              }
            >
              {user.name}
            </DropdownMenuCheckboxItem>
          ))}

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <button
                onClick={clearFilters}
                className="w-full px-2 py-1.5 rounded"
              >
                Clear all filters
              </button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
