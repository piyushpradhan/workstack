import { useState, useMemo } from "react";
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
  const [projectSearch, setProjectSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projects;
    const searchLower = projectSearch.toLowerCase();
    return projects.filter((p) =>
      p.name.toLowerCase().includes(searchLower)
    );
  }, [projects, projectSearch]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const searchLower = userSearch.toLowerCase();
    return users.filter((u) =>
      u.name?.toLowerCase().includes(searchLower) ||
      u.id.toLowerCase().includes(searchLower)
    );
  }, [users, userSearch]);

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
          className="w-80 max-h-[60vh] overflow-y-auto"
        >
          <div className="p-2 space-y-2">
            <DropdownMenuLabel className="px-2">
              Filter by Project
            </DropdownMenuLabel>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects..."
                className="pl-8 h-8 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={selectedProjects.includes(project.id)}
                  onCheckedChange={() =>
                    toggleFilter(project.id, selectedProjects, setSelectedProjects)
                  }
                  className="px-4"
                >
                  <span className="truncate">{project.name}</span>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                No projects found
              </div>
            )}
          </div>

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
          <div className="p-2 space-y-2">
            <DropdownMenuLabel className="px-2">
              Filter by Assignee
            </DropdownMenuLabel>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-8 h-8 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={selectedAssignees.includes(user.id)}
                  onCheckedChange={() =>
                    toggleFilter(user.id, selectedAssignees, setSelectedAssignees)
                  }
                  className="px-4"
                >
                  <span className="truncate">{user.name || user.id}</span>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                No users found
              </div>
            )}
          </div>

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
