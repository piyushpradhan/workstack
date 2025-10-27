import type { Task } from '@/state/tasks/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityIndicator } from '@/components/common/PriorityIndicator';
import { Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useProject } from '@/api/projects/queries';

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
    isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
    const { data: project } = useProject(task.projectId);

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' && task.status !== 'CANCELLED';
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.01, boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)' }}
            onClick={onClick}
            className={`bg-[#161b22] border border-[#30363d] rounded p-2.5 md:p-3 cursor-pointer hover:border-[#484f58] transition-smooth shadow-sm ${isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
                <h3 className="text-[#e6edf3] flex-1 line-clamp-2 text-sm md:text-base">{task.title}</h3>
                <PriorityIndicator priority={task.priority} />
            </div>

            {task.description && (
                <p className="text-[#7d8590] text-xs mb-2 md:mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-1.5 flex-wrap mb-2 md:mb-2.5">
                <StatusBadge status={task.status} />

                {project && (
                    <span className="text-[#7d8590] text-xs px-1.5 md:px-2 py-0.5 bg-[#21262d] rounded border border-[#30363d] truncate max-w-[120px]">
                        {project.name}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between pt-2 md:pt-2.5 border-t border-[#21262d] gap-2">
                <div className="flex items-center gap-1.5 text-[#7d8590] text-xs flex-1 min-w-0">
                    <User className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                    <span className="truncate">Unassigned</span>
                </div>

                {dueDate && (
                    <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${isOverdue ? 'text-[#f85149]' : 'text-[#7d8590]'}`}>
                        <Calendar className="w-3 h-3" />
                        <span className="hidden sm:inline">
                            {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="sm:hidden">
                            {dueDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
