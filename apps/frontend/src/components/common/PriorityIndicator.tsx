import type { TaskPriority } from '@/state/tasks/types';
import { AlertCircle } from 'lucide-react';

interface PriorityIndicatorProps {
    priority: TaskPriority;
    showLabel?: boolean;
}

const priorityConfig = {
    LOW: { label: 'Low', color: '#7d8590', icon: '○' },
    MEDIUM: { label: 'Medium', color: '#58a6ff', icon: '◐' },
    HIGH: { label: 'High', color: '#ffa657', icon: '●' },
    URGENT: { label: 'Urgent', color: '#f85149', icon: '⬤' },
};

export function PriorityIndicator({ priority, showLabel = false }: PriorityIndicatorProps) {
    const config = priorityConfig[priority];

    return (
        <div className="flex items-center gap-1.5">
            {priority === 'URGENT' ? (
                <AlertCircle className="w-3.5 h-3.5" style={{ color: config.color }} />
            ) : (
                <span style={{ color: config.color }}>{config.icon}</span>
            )}
            {showLabel && (
                <span className="text-muted-foreground">{config.label}</span>
            )}
        </div>
    );
}
