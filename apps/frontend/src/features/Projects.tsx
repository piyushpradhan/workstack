import { useState, useMemo } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Plus,
  Search,
  Grid3x3,
  List,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/api/auth/queries";
import { useAllProjects } from "@/api/projects/queries";
import type { Project } from "@/api/projects/types";
import { useModal } from "@/contexts/ModalContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useErrorHandler } from "@/components/ErrorBoundary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const Projects = () => {
  useDocumentTitle("Projects");
  const { user: currentUser } = useAuth();
  const projectsQuery = useAllProjects();
  const projects = projectsQuery.data?.pages.flatMap(page => page.data) ?? [];
  const isLoading = projectsQuery.isLoading;
  const error = projectsQuery.error;
  const refetch = projectsQuery.refetch;
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "owned">("all");
  const { openModal } = useModal();
  const { handleError } = useErrorHandler();

  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    return projects.filter((project: Project) => {
      try {
        const matchesSearch =
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesFilter =
          filter === "all" ||
          project.members.some((member) => member.id === currentUser?.id);
        return matchesSearch && matchesFilter;
      } catch (err) {
        handleError(err as Error, "Projects filtering");
        return false;
      }
    });
  }, [projects, searchQuery, filter, currentUser?.id, handleError]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 100 &&
      projectsQuery.hasNextPage &&
      !projectsQuery.isFetchingNextPage
    ) {
      projectsQuery.fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Failed to load projects
            </h2>
            <p className="text-muted-foreground mb-4">
              {error.message ||
                "Something went wrong while loading your projects."}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col p-6 space-y-6 h-full">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-foreground mb-2 text-2xl font-semibold">Projects</h1>
            <p className="text-muted-foreground text-base">
              {filteredProjects.length === 0
                ? "No projects yet"
                : `${filteredProjects.length} ${filteredProjects.length === 1 ? "project" : "projects"}`}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-10"
              aria-label="Search projects"
              role="searchbox"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-2 bg-muted border rounded-md p-1"
              role="tablist"
              aria-label="Project filters"
            >
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded transition-colors text-sm ${filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                role="tab"
                aria-selected={filter === "all"}
                aria-controls="projects-content"
              >
                <span className="hidden sm:inline">All Projects</span>
                <span className="sm:hidden">All</span>
              </button>
              <button
                onClick={() => setFilter("owned")}
                className={`px-3 py-1.5 rounded transition-colors text-sm ${filter === "owned"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                role="tab"
                aria-selected={filter === "owned"}
                aria-controls="projects-content"
              >
                <span className="hidden sm:inline">Owned by Me</span>
                <span className="sm:hidden">Mine</span>
              </button>
            </div>

            <div
              className="flex items-center gap-1 bg-muted border rounded-md p-1"
              role="group"
              aria-label="View mode"
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full" onScroll={handleScroll}>
            <motion.div
              layout
              id="projects-content"
              role="region"
              aria-label={`${filteredProjects.length} projects in ${viewMode} view`}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-full"
                  : "space-y-4"
              }
            >
              {filteredProjects.map((project: Project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          </div>
        ) : (
          <div
            className="text-center py-12"
            role="region"
            aria-label="No projects found"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground mb-2 font-semibold">No projects found</h3>
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
        )}

        <ProjectModal />
      </div>
    </ErrorBoundary>
  );
};

export default Projects;
