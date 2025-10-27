import type { TaskStatus } from '@/state/tasks/types';

interface StatusBadgeProps {
    status: TaskStatus;
}

const statusConfig = {
    TODO: { label: 'Todo', className: 'bg-[#7d8590]/10 text-[#7d8590] border-[#30363d]' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-[#5e6ad2]/10 text-[#5e6ad2] border-[#5e6ad2]/30' },
    IN_REVIEW: { label: 'In Review', className: 'bg-[#ffa657]/10 text-[#ffa657] border-[#ffa657]/30' },
    DONE: { label: 'Done', className: 'bg-[#7ee787]/10 text-[#7ee787] border-[#7ee787]/30' },
    CANCELLED: { label: 'Cancelled', className: 'bg-[#f85149]/10 text-[#f85149] border-[#f85149]/30' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded border ${config.className}`}>
            {config.label}
        </span>
    );
}
