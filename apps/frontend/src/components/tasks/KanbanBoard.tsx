import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus } from 'lucide-react';
import { useAllTasks, useTasksByProject, useUpdateTask } from '@/api/tasks/queries';
import type { Task, TaskStatus } from '@/state';
import { useNavigate, useParams } from 'react-router-dom';

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'Todo', color: 'muted' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { status: 'IN_REVIEW', label: 'In Review', color: 'orange' },
  { status: 'DONE', label: 'Done', color: 'green' },
  { status: 'CANCELLED', label: 'Cancelled', color: 'destructive' },
];

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag as any}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

interface ColumnProps {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

function Column({ status, label, color, tasks, onTaskClick, onAddTask }: ColumnProps) {
  const updateTaskMutation = useUpdateTask();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        updateTaskMutation.mutate({ id: item.id, data: { status } });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`flex flex-col bg-background rounded-lg border shadow-sm ${isOver ? 'border-blue ring-2 ring-blue/20' : 'border-border'
        } transition-smooth md:h-full h-[calc(100vh-16rem)]`}
    >
      <div className="p-3 md:p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shadow-sm flex-shrink-0 bg-${color}`} />
            <h3 className="text-foreground text-sm md:text-base truncate">{label}</h3>
          </div>
          <span className="text-muted-foreground px-2 py-1 bg-muted rounded text-xs flex-shrink-0">{tasks.length}</span>
        </div>
      </div>

      <div className="flex-1 p-3 md:p-4 space-y-3 overflow-y-auto">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 border-t border-border">
        <button
          onClick={() => onAddTask(status)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-smooth"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs md:text-sm">Add task</span>
        </button>
      </div>
    </div>
  );
}


export function KanbanBoard() {
  const { id: projectId } = useParams();
  const { data: tasksByProject = [] } = useTasksByProject(projectId ?? '');
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
          const columnTasks = tasks.filter((task: Task) => task.status === column.status);
          return (
            <Column
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
        <div className="flex gap-3 pb-4" style={{ minWidth: 'min-content' }}>
          {columns.map((column) => {
            const columnTasks = tasks.filter((task: Task) => task.status === column.status);
            return (
              <div key={column.status} className="w-72 flex-shrink-0">
                <Column
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
