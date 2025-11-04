interface TasksHeaderProps {
  count: number;
}

export function TasksHeader({ count }: TasksHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-white mb-1 md:mb-2 text-xl md:text-2xl">Tasks</h1>
        <p className="text-[#8b949e] text-sm md:text-base">
          {count} task{count !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
