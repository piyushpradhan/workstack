import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { stateKeys } from "@/state";
import type { UpdateProjectRequest, Project } from "@/api/projects/types";
import type { ProjectFilters } from "@/api/projects";
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

export const useAllProjects = (limit: number = 21, filters?: ProjectFilters) => {
  return useInfiniteQuery({
    queryKey: [...projectKeys.lists(), limit, filters],
    queryFn: ({ pageParam }) => getAllProjects(limit, pageParam, filters),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.cursor : undefined;
    },
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
    onMutate: async () => {
      // Cancel all outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });

      return {};
    },
    onSuccess: (newProject: Project) => {
      // Cache the new project detail
      queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
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

  const allProjects = allProjectsQuery.data?.pages.flatMap(page => page.data) ?? [];

  return {
    // Query data
    allProjects,
    userProjects: allProjects, // Same as allProjects

    // Loading states
    isLoadingAll: allProjectsQuery.isLoading,
    isLoadingUser: allProjectsQuery.isLoading, // Same as isLoadingAll
    isLoading: allProjectsQuery.isLoading,

    // Error states
    allProjectsError: allProjectsQuery.error,
    userProjectsError: allProjectsQuery.error, // Same as allProjectsError

    // Pagination
    hasNextPage: allProjectsQuery.hasNextPage,
    fetchNextPage: allProjectsQuery.fetchNextPage,

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
