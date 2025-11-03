import { TaskModal } from "./TaskModal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAllTasks, useTasksByProject } from "@/api/tasks/queries";
import type { Task, TaskStatus } from "@/state";
import { useNavigate, useParams } from "react-router-dom";
import { KanbanColumn } from "./KanbanColumn";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "TODO", label: "Todo", color: "muted" },
  { status: "IN_PROGRESS", label: "In Progress", color: "blue" },
  { status: "IN_REVIEW", label: "In Review", color: "orange" },
  { status: "DONE", label: "Done", color: "green" },
  { status: "CANCELLED", label: "Cancelled", color: "destructive" },
];

export function KanbanBoard() {
  const { id: projectId } = useParams();
  const { data: tasksByProject = [] } = useTasksByProject(projectId ?? "");
  const { data: allTasks = [] } = useAllTasks();
  const tasks = projectId ? tasksByProject : allTasks;
  const navigate = useNavigate();

  const handleTaskClick = (task: Task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleAddTask = (_status: TaskStatus) => {
    // Add task handler - can be implemented later
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 h-full overflow-y-auto">
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
              onAddTask={handleAddTask}
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
                  onAddTask={handleAddTask}
                />
              </div>
            );
          })}
        </div>
      </div>

      <TaskModal />
    </DndProvider>
  );
}
