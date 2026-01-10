import { motion } from "motion/react";
import { Search, Plus } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import type { Project } from "@/api/projects/types";
import { useModal } from "@/contexts/ModalContext";

interface ProjectsListProps {
  projects: Project[];
  viewMode: "grid" | "list";
  searchQuery: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const ProjectsList = ({
  projects,
  viewMode,
  searchQuery,
  hasNextPage,
  isFetchingNextPage,
  onScroll,
}: ProjectsListProps) => {
  const { openModal } = useModal();

  if (projects.length === 0) {
    return (
      <div
        className="text-center py-12"
        role="region"
        aria-label="No projects found"
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-foreground mb-2 font-semibold">
          No projects found
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery
            ? "Try adjusting your search terms or filters"
            : "Get started by creating your first project to organize your work"}
        </p>
        {!searchQuery && (
          <Button
            onClick={() => openModal("project")}
            className="gap-2"
            aria-label="Create new project"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden w-full scroll-smooth"
      onScroll={onScroll}
      role="main"
      aria-label="Projects list"
    >
      <motion.div
        layout
        id="projects-content"
        role="region"
        aria-label={`${projects.length} projects in ${viewMode} view`}
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1"
            : "space-y-4 p-1"
        }
      >
        {projects.map((project: Project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>
      {isFetchingNextPage && (
        <div
          className="flex items-center justify-center py-8 px-4"
          role="status"
          aria-live="polite"
          aria-label="Loading more projects"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading more projects...
            </p>
          </div>
        </div>
      )}
      {!hasNextPage && projects.length > 20 && (
        <div
          className="flex items-center justify-center py-6 px-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-muted-foreground">
            You've reached the end of the list
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
