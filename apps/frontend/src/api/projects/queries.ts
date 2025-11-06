import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stateKeys } from "@/state";
import type { UpdateProjectRequest, Project } from "@/api/projects/types";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/api/projects";

export const projectKeys = {
  all: stateKeys.projects.all,
  lists: stateKeys.projects.lists,
  list: stateKeys.projects.list,
  details: stateKeys.projects.details,
  detail: stateKeys.projects.detail,
  myProjects: stateKeys.projects.myProjects,
  byStatus: stateKeys.projects.byStatus,
  byUser: stateKeys.projects.byUser,
} as const;

export const useAllProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: getAllProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onMutate: async (newProjectData) => {
      // Cancel all outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      // Snapshot previous values for rollback
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.lists(),
      );

      // Create optimistic project
      const tempId = `temp-${Date.now()}`;
      const optimisticProject: Project = {
        id: tempId,
        name: newProjectData.name,
        description: newProjectData.description || "",
        status: newProjectData.status,
        startDate: newProjectData.startDate || "",
        endDate: newProjectData.endDate || "",
        owners: [], // Will be populated on success
        members: [], // Will be populated from memberIds on success
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update project list
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (old) => [
        ...(old ?? []),
        optimisticProject,
      ]);

      return {
        previousProjects,
        tempId,
      };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
    },
    onSuccess: (newProject: Project, _variables, context) => {
      // Replace optimistic project with real one
      queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);

      // Update list with the real project
      queryClient.setQueryData<Project[]>(
        projectKeys.lists(),
        (old) =>
          old?.map((project) =>
            project.id === context?.tempId || project.id === newProject.id
              ? newProject
              : project,
          ) ?? [],
      );
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      updateProject(id, data),
    onSuccess: (updatedProject: Project) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectKeys.detail(updatedProject.id),
        updatedProject,
      );

      // Invalidate lists to ensure they reflect the changes
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("Error updating project:", error.message);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, deletedProjectId) => {
      // Remove the project from cache
      queryClient.removeQueries({
        queryKey: projectKeys.detail(deletedProjectId),
      });

      // Invalidate lists to ensure they reflect the deletion
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("Error deleting project:", error.message);
    },
  });
};

export const useProjects = () => {
  const allProjectsQuery = useAllProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  return {
    // Query data
    allProjects: allProjectsQuery.data ?? [],
    userProjects: allProjectsQuery.data ?? [], // Same as allProjects

    // Loading states
    isLoadingAll: allProjectsQuery.isLoading,
    isLoadingUser: allProjectsQuery.isLoading, // Same as isLoadingAll
    isLoading: allProjectsQuery.isLoading,

    // Error states
    allProjectsError: allProjectsQuery.error,
    userProjectsError: allProjectsQuery.error, // Same as allProjectsError

    // Mutation functions
    createProject: createMutation.mutate,
    updateProject: updateMutation.mutate,
    deleteProject: deleteMutation.mutate,

    // Async mutation functions
    createProjectAsync: createMutation.mutateAsync,
    updateProjectAsync: updateMutation.mutateAsync,
    deleteProjectAsync: deleteMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Refetch functions
    refetchAll: allProjectsQuery.refetch,
    refetchUser: allProjectsQuery.refetch, // Same as refetchAll
    refetch: allProjectsQuery.refetch,
  };
};
