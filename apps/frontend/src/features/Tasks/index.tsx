import { useState } from "react";
import { KanbanBoard } from "../../components/tasks/KanbanBoard";
import { TaskModal } from "../../components/tasks/TaskModal";
import { useUsers } from "@/api/users/queries";
import { useAllTasks } from "@/api/tasks/queries";
import { useAllProjects } from "@/api/projects/queries";
import type { TaskPriority, TaskStatus } from "@/state";
import { TasksHeader } from "./TasksHeader";
import { TasksFilters } from "./TasksFilters";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function Tasks() {
  useDocumentTitle("Tasks");
  const { data: tasks } = useAllTasks();
  const { data: projects } = useAllProjects();
  const { allProjectUsers: users } = useUsers();
  const [isModalOpen, _setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>(
    [],
  );
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject =
      selectedProjects.length === 0 ||
      selectedProjects.includes(task.projectId);
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
    const matchesPriority =
      selectedPriorities.length === 0 ||
      selectedPriorities.includes(task.priority);
    const matchesAssignee =
      selectedAssignees.length === 0 ||
      (task.ownerId && selectedAssignees.includes(task.ownerId));

    return (
      matchesSearch &&
      matchesProject &&
      matchesStatus &&
      matchesPriority &&
      matchesAssignee
    );
  });

  const hasActiveFilters =
    selectedProjects.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedAssignees.length > 0;

  const clearFilters = () => {
    setSelectedProjects([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedAssignees([]);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <TasksHeader
        count={filteredTasks?.length ?? 0}
      />

      <TasksFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        projects={projects ?? []}
        users={users ?? []}
        selectedProjects={selectedProjects}
        setSelectedProjects={setSelectedProjects}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        selectedAssignees={selectedAssignees}
        setSelectedAssignees={setSelectedAssignees}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <KanbanBoard />

      {isModalOpen && <TaskModal />}
    </div>
  );
}
