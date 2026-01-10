import { useTasks } from "@/api/tasks/queries";
import { TaskCard } from "@/components/tasks/TaskCard";
import { isTemporaryId } from "@/lib/utils";
import { Activity, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const ActivityGrid = () => {
  const navigate = useNavigate();

  const { ownedTasks } = useTasks();

  const recentTasks = useMemo(() => {
    return [...ownedTasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);
  }, [ownedTasks]);

  const upcomingTasks = useMemo(() => {
    return [...ownedTasks]
      .filter(
        (t) => t.dueDate && t.status !== "DONE" && t.status !== "CANCELLED",
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
      )
      .slice(0, 5);
  }, [ownedTasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm"
        role="region"
        aria-label="Recent activity"
      >
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h2 className="text-foreground text-base md:text-lg">
            Recent Activity
          </h2>
        </div>
        <div className="space-y-2 md:space-y-3">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => {
                  if (!isTemporaryId(task.id)) {
                    navigate(`/tasks/${task.id}`);
                  }
                }}
              />
            ))
          ) : (
            <div
              className="text-center py-8 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              No recent tasks
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-lg p-4 md:p-5 shadow-sm"
        role="region"
        aria-label="Upcoming deadlines"
      >
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h2 className="text-foreground text-base md:text-lg">
            Upcoming Deadlines
          </h2>
        </div>
        <div className="space-y-2 md:space-y-3">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => {
              const dueDate = new Date(task.dueDate!);
              const isOverdue = dueDate < new Date();
              const daysUntil = Math.ceil(
                (dueDate.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              const isTemporary = isTemporaryId(task.id);

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    if (!isTemporary) {
                      navigate(`/tasks/${task.id}`);
                    }
                  }}
                  className={`bg-muted border border-border rounded-md p-2.5 md:p-3 transition-smooth shadow-sm ${
                    isTemporary
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:border-border/80 cursor-pointer"
                  }`}
                  role="button"
                  tabIndex={isTemporary ? -1 : 0}
                  aria-label={`Task: ${task.title}, ${isOverdue ? `overdue by ${Math.abs(daysUntil)} days` : `due in ${daysUntil} days`}`}
                  aria-disabled={isTemporary}
                >
                  <h3 className="text-foreground mb-1 md:mb-1.5 text-sm md:text-base truncate">
                    {task.title}
                  </h3>
                  <div
                    className={`flex items-center gap-1.5 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {isOverdue
                        ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""}`
                        : `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className="text-center py-8 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              No upcoming deadlines
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityGrid;
