import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/api/auth/queries";
import { useAllProjects } from "@/api/projects/queries";
import { useTasks } from "@/api/tasks/queries";
import { TaskModal } from "@/components/tasks/TaskModal";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import ActivityGrid from "@/features/Dashboard/ActivityGrid";
import Loading from "@/features/Dashboard/Loading";
import ActivityError from "@/features/Dashboard/ActivityError";
import StatsGrid from "./StatsGrid";

const Dashboard = () => {
  useDocumentTitle("Dashboard");
  const navigate = useNavigate();
  const {
    user: currentUser,
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const projectsQuery = useAllProjects();
  const projectsLoading = projectsQuery.isLoading;
  const projectsError = projectsQuery.isError;
  const { isLoading: tasksLoading, ownedTasksError: tasksError } = useTasks();

  if (authLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Authentication Error
            </h2>
            <p className="text-muted-foreground mb-4">
              {(authError as Error)?.message ||
                "Failed to load user data. Please try again."}
            </p>
            <Button onClick={() => navigate("/login")} variant="default">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full h-full">
        <div>
          <h1 className="text-foreground mb-2 text-xl md:text-2xl font-semibold">
            Welcome back, {currentUser!.name}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Here's an overview of your projects and tasks
          </p>
        </div>

        <StatsGrid />

        {tasksLoading || projectsLoading ? (
          <Loading />
        ) : projectsError || tasksError || authError ? (
          <ActivityError />
        ) : (
          <ActivityGrid />
        )}

        <TaskModal />
        <ProjectModal />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
