import type { TaskStatus } from '@/state/tasks/types';

interface StatusBadgeProps {
    status: TaskStatus;
}

const statusConfig = {
    TODO: { label: 'Todo', className: 'bg-muted/10 text-muted-foreground border-border' },
    IN_PROGRESS: { label: 'In Progress', className: 'bg-blue/10 text-blue border-blue/30' },
    IN_REVIEW: { label: 'In Review', className: 'bg-orange/10 text-orange border-orange/30' },
    DONE: { label: 'Done', className: 'bg-green/10 text-green border-green/30' },
    CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded border text-xs ${config.className}`}>
            {config.label}
        </span>
    );
}
