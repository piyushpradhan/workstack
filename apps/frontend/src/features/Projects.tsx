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
import { ProjectsFilters } from "./Projects/ProjectsFilters";

type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

const Projects = () => {
  useDocumentTitle("Projects");
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);

  const apiFilters = useMemo(() => {
    const result: {
      search?: string;
      statuses?: string[];
    } = {};

    if (searchQuery.trim()) {
      result.search = searchQuery.trim();
    }
    if (selectedStatuses.length > 0) {
      result.statuses = selectedStatuses;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [searchQuery, selectedStatuses]);

  const { error, fetchNextPage, isFetchingNextPage, isLoading, hasNextPage, data, refetch } = useAllProjects(21, apiFilters);
  const projects = data?.pages.flatMap(page => page.data) ?? [];
  const { openModal } = useModal();
  const { handleError } = useErrorHandler();

  const hasActiveFilters = useMemo(
    () => selectedStatuses.length > 0,
    [selectedStatuses]
  );

  const clearFilters = () => {
    setSelectedStatuses([]);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 100 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
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
              {projects.length === 0
                ? "No projects yet"
                : `${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
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
            <ProjectsFilters
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />

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

        {projects.length > 0 ? (
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden w-full scroll-smooth"
            onScroll={handleScroll}
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
                  <p className="text-sm text-muted-foreground">Loading more projects...</p>
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
