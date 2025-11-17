import { useState, useMemo } from "react";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { useUsers } from "@/api/users/queries";
import { useAllTasks } from "@/api/tasks/queries";
import { useAllProjects } from "@/api/projects/queries";
import type { TaskPriority, TaskStatus } from "@/state";
import { TasksHeader } from "@/features/Tasks/TasksHeader";
import { TasksFilters } from "@/features/Tasks/TasksFilters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface TaskFiltersState {
  searchQuery: string;
  projects: string[];
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assignees: string[];
}

const initialFilters: TaskFiltersState = {
  searchQuery: "",
  projects: [],
  statuses: [],
  priorities: [],
  assignees: [],
};

const Tasks = () => {
  useDocumentTitle("Tasks");
  const allProjectsQuery = useAllProjects();
  const { allProjectUsers: users } = useUsers();
  const [isModalOpen, _setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersState>(initialFilters);

  const apiFilters = useMemo(() => {
    const result: {
      search?: string;
      projectIds?: string[];
      statuses?: string[];
      priorities?: string[];
      assigneeIds?: string[];
    } = {};

    if (filters.searchQuery.trim()) {
      result.search = filters.searchQuery.trim();
    }
    if (filters.projects.length > 0) {
      result.projectIds = filters.projects;
    }
    if (filters.statuses.length > 0) {
      result.statuses = filters.statuses;
    }
    if (filters.priorities.length > 0) {
      result.priorities = filters.priorities;
    }
    if (filters.assignees.length > 0) {
      result.assigneeIds = filters.assignees;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  const allTasksQuery = useAllTasks(50, apiFilters);
  const tasks = allTasksQuery.data?.pages.flatMap(page => page.data) ?? [];
  const projects = allProjectsQuery.data?.pages.flatMap(page => page.data) ?? [];

  const hasActiveFilters = useMemo(
    () =>
      filters.projects.length > 0 ||
      filters.statuses.length > 0 ||
      filters.priorities.length > 0 ||
      filters.assignees.length > 0,
    [filters]
  );

  const updateFilter = <K extends keyof TaskFiltersState>(
    key: K,
    value: TaskFiltersState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4 md:space-y-6">
      <TasksHeader
        count={tasks?.length ?? 0}
      />

      <TasksFilters
        searchQuery={filters.searchQuery}
        onSearchChange={(value) => updateFilter("searchQuery", value)}
        projects={projects ?? []}
        users={users ?? []}
        selectedProjects={filters.projects}
        setSelectedProjects={(value) => updateFilter("projects", value)}
        selectedStatuses={filters.statuses}
        setSelectedStatuses={(value) => updateFilter("statuses", value)}
        selectedPriorities={filters.priorities}
        setSelectedPriorities={(value) => updateFilter("priorities", value)}
        selectedAssignees={filters.assignees}
        setSelectedAssignees={(value) => updateFilter("assignees", value)}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <KanbanBoard filters={apiFilters} />

      {isModalOpen && <TaskModal />}
    </div>
  );
}

export default Tasks;
