import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

interface TasksHeaderProps {
    count: number;
    onNewTask: () => void;
}

export function TasksHeader({ count, onNewTask }: TasksHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <h1 className="text-white mb-1 md:mb-2 text-xl md:text-2xl">Tasks</h1>
                <p className="text-[#8b949e] text-sm md:text-base">{count} task{count !== 1 ? 's' : ''}</p>
            </div>
            <Button onClick={onNewTask} className="bg-[#0969da] hover:bg-[#0550ae] text-white gap-2 flex-shrink-0">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Task</span>
            </Button>
        </div>
    );
}


