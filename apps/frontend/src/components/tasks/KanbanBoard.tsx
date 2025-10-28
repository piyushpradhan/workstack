import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus } from '@/state';

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'Todo', color: '#7d8590' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#5e6ad2' },
  { status: 'IN_REVIEW', label: 'In Review', color: '#ffa657' },
  { status: 'DONE', label: 'Done', color: '#7ee787' },
  { status: 'CANCELLED', label: 'Cancelled', color: '#f85149' },
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
    <div ref={drag}>
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
  // const { updateTask } = useTasks();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        // updateTask(item.id, { status });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`flex flex-col bg-[#0d1117] rounded-lg border shadow-sm ${isOver ? 'border-[#5e6ad2] ring-2 ring-[#5e6ad2]/20' : 'border-[#30363d]'
        } transition-smooth md:h-full h-[calc(100vh-16rem)]`}
    >
      <div className="p-2.5 md:p-3 border-b border-[#21262d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <h3 className="text-[#e6edf3] text-sm md:text-base truncate">{label}</h3>
          </div>
          <span className="text-[#7d8590] px-1.5 py-0.5 bg-[#161b22] rounded text-xs flex-shrink-0">{tasks.length}</span>
        </div>
      </div>

      <div className="flex-1 p-2.5 md:p-3 space-y-2 md:space-y-2.5 overflow-y-auto">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-[#7d8590]">
            No tasks
          </div>
        )}
      </div>

      <div className="p-2.5 md:p-3 border-t border-[#21262d]">
        <button
          onClick={() => onAddTask(status)}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#161b22] rounded transition-smooth"
        >
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm">Add task</span>
        </button>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  projectId?: string;
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('TODO');

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(undefined);
    setNewTaskStatus(status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(undefined);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 h-[calc(100vh-12rem)]">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
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
      <div className="md:hidden overflow-x-auto -mx-4 px-4">
        <div className="flex gap-3 pb-4" style={{ minWidth: 'min-content' }}>
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status);
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
