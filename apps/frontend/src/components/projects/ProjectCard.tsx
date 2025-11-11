import type { Project } from "@/api/projects/types";
import { Users, CheckCircle2, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { isTemporaryId } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const isTemporary = isTemporaryId(project.id);

  const handleClick = () => {
    if (!isTemporary) {
      navigate(`/projects/${project.id}`);
    }
  };

  // TODO: Implement task hooks when task API is ready
  const tasks: any[] = []; // taskManager.getTasksByProjectId(project.id);

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === "DONE").length;
  const totalTasks = projectTasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const members = project.members || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isTemporary ? { scale: 1.01 } : undefined}
      onClick={handleClick}
      className={`bg-card border rounded-lg p-4 transition-colors shadow-sm ${isTemporary
        ? "opacity-60 cursor-not-allowed"
        : "cursor-pointer hover:border-border"
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-card-foreground mb-1 text-base truncate">
            {project.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm min-w-0">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          <span className="text-primary text-sm flex-shrink-0">
            {completionRate}%
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            className="bg-primary h-full rounded-full"
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-border">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-1.5">
            {members.slice(0, 3).map((member) => {
              return (
                <div
                  key={member.id}
                  className="w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm"
                  title={member.name}
                >
                  <span className="text-primary-foreground text-xs">
                    {member.name.charAt(0)}
                  </span>
                </div>
              );
            })}
            {members.length > 3 && (
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center border-2 border-background">
                <span className="text-muted-foreground text-xs">
                  +{members.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          <span>
            {new Date(project.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
