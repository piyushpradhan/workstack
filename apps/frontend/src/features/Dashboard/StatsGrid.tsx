import { Link } from "react-router-dom";
import { useUserStats } from "@/api/users/queries";
import { motion } from "motion/react";

import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import StatsError from "@/features/Dashboard/StatsError";

const StatsGrid = () => {
  const userStats = useUserStats();

  const stats = [
    {
      label: "Active Projects",
      value: userStats.data?.activeProjects ?? 0,
      icon: FolderKanban,
      color: "indigo-500",
      link: "/projects",
    },
    {
      label: "My Tasks",
      value: userStats.data?.myTasks ?? 0,
      icon: CheckSquare,
      color: "primary",
      link: "/tasks",
    },
    {
      label: "Overdue Tasks",
      value: userStats.data?.overdueTasks ?? 0,
      icon: AlertCircle,
      color: "destructive",
      link: "/tasks",
    },
    {
      label: "Completed Tasks",
      value: userStats.data?.completedTasks ?? 0,
      icon: TrendingUp,
      color: "primary",
      link: "/tasks",
    },
  ];

  if (userStats.isError) {
    return <StatsError />;
  }

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      role="region"
      aria-label="Dashboard statistics"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link to={stat.link} aria-label={`View ${stat.label.toLowerCase()}`}>
            <div className="bg-card border border-border rounded-lg p-3 md:p-5 hover:border-border/80 transition-smooth cursor-pointer shadow-sm">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div
                  className={`rounded-lg flex items-center justify-center shadow-sm bg-${stat.color}/20`}
                >
                  <stat.icon
                    className={`w-4 h-4 md:w-5 md:h-5 text-${stat.color}`}
                  />
                </div>
              </div>
              <div className="text-foreground mb-1 text-xl md:text-2xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs truncate">
                {stat.label}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;
