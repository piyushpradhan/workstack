import { useState, useMemo } from "react";
import { Search, Grid3x3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAllProjects } from "@/api/projects/queries";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { ProjectsFilters } from "./ProjectsFilters";
import Loading from "./Loading";
import Error from "./Error";
import ProjectsList from "./ProjectsList";

type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

const Projects = () => {
  useDocumentTitle("Projects");
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

  const {
    error,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    data,
    refetch,
  } = useAllProjects(21, apiFilters);
  const projects = data?.pages.flatMap((page) => page.data) ?? [];

  const hasActiveFilters = useMemo(
    () => selectedStatuses.length > 0,
    [selectedStatuses],
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

  return (
    <ErrorBoundary>
      <div className="flex flex-col p-6 space-y-6 h-full">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-foreground mb-2 text-2xl font-semibold">
              Projects
            </h1>
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
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
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
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
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

        {isLoading ? (
          <Loading />
        ) : error ? (
          <Error
            error={error}
            onRetry={() => {
              refetch();
            }}
          />
        ) : (
          <ProjectsList
            projects={projects}
            viewMode={viewMode}
            searchQuery={searchQuery}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onScroll={handleScroll}
          />
        )}

        <ProjectModal />
      </div>
    </ErrorBoundary>
  );
};

export default Projects;
