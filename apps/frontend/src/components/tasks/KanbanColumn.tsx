import { Plus } from 'lucide-react';
import { useDrop } from 'react-dnd';
import { useUpdateTask } from '@/api/tasks/queries';
import type { Task, TaskStatus } from '@/state';
import { DraggableTaskCard } from './DraggableTaskCard';

interface KanbanColumnProps {
    status: TaskStatus;
    label: string;
    color: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({ status, label, color, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
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
            className={`flex flex-col bg-background rounded-lg border shadow-sm ${isOver ? 'border-blue ring-2 ring-blue/20' : 'border-border'} transition-smooth md:h-full h-[calc(100vh-16rem)]`}
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


