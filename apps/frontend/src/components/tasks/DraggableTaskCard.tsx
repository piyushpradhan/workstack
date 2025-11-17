import { useDrag } from "react-dnd";
import { TaskCard } from "./TaskCard";
import type { Task } from "@/api/tasks/types";
import { isTemporaryId } from "@/lib/utils";

interface DraggableTaskCardProps {
  task: Task;
  onClick: () => void;
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const isTemporary = isTemporaryId(task.id);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "task",
      item: { id: task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: !isTemporary,
    }),
    [isTemporary, task.id, task.status],
  );

  return (
    <div ref={!isTemporary ? (drag as any) : undefined}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}
