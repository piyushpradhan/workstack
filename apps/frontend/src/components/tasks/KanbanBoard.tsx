import { TaskModal } from "./TaskModal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAllTasks, useTasksByProject } from "@/api/tasks/queries";
import type { TaskStatus } from "@/state";
import type { Task } from "@/api/tasks/types";
import { useNavigate, useParams } from "react-router-dom";
import { KanbanColumn } from "./KanbanColumn";
import { isTemporaryId } from "@/lib/utils";
import type { TaskFilters } from "@/api/tasks";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "TODO", label: "Todo", color: "muted" },
  { status: "IN_PROGRESS", label: "In Progress", color: "blue" },
  { status: "IN_REVIEW", label: "In Review", color: "orange" },
  { status: "DONE", label: "Done", color: "green" },
  { status: "CANCELLED", label: "Cancelled", color: "destructive" },
];

interface KanbanBoardProps {
  filters?: TaskFilters;
}

export function KanbanBoard({ filters }: KanbanBoardProps = {}) {
  const { id: projectId } = useParams();
  const tasksByProjectQuery = useTasksByProject(projectId ?? "");
  const tasksByProject = tasksByProjectQuery.data?.pages.flatMap(page => page.data) ?? [];
  const allTasksQuery = useAllTasks(50, filters);
  const allTasks = allTasksQuery.data?.pages.flatMap(page => page.data) ?? [];
  const tasks = projectId ? tasksByProject : allTasks;
  const tasksQuery = projectId ? tasksByProjectQuery : allTasksQuery;
  const navigate = useNavigate();

  const handleTaskClick = (task: Task) => {
    if (!isTemporaryId(task.id)) {
      navigate(`/tasks/${task.id}`);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Desktop: Grid layout */}
      <div className="flex-1 overflow-y-hidden">
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (task: Task) => task.status === column.status,
            );
            return (
              <KanbanColumn
                key={column.status}
                {...column}
                tasks={columnTasks}
                onTaskClick={handleTaskClick}
                hasNextPage={tasksQuery.hasNextPage}
                isFetchingNextPage={tasksQuery.isFetchingNextPage}
                fetchNextPage={tasksQuery.fetchNextPage}
              />
            );
          })}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4 h-full">
          <div className="flex gap-3 pb-4" style={{ minWidth: "min-content" }}>
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task: Task) => task.status === column.status,
              );
              return (
                <div key={column.status} className="w-72 flex-shrink-0">
                  <KanbanColumn
                    {...column}
                    tasks={columnTasks}
                    onTaskClick={handleTaskClick}
                    hasNextPage={tasksQuery.hasNextPage}
                    isFetchingNextPage={tasksQuery.isFetchingNextPage}
                    fetchNextPage={tasksQuery.fetchNextPage}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <TaskModal />
      </div>
    </DndProvider>
  );
}
