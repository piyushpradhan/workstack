import { useDrag } from 'react-dnd';
import { TaskCard } from './TaskCard';
import type { Task } from '@/state';

interface DraggableTaskCardProps {
    task: Task;
    onClick: () => void;
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
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


