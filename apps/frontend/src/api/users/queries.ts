import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { stateKeys } from "@/state";

import { getAllProjectUsers } from "@/api/users";
import { useProjects } from "../projects/queries";

export const userKeys = {
  all: stateKeys.users.all,
  details: stateKeys.users.details,
  detail: stateKeys.users.detail,
  byProject: stateKeys.users.byProject,
  byStatus: stateKeys.users.byStatus,
} as const;

export const useUsersByProjects = (projectIds: string[], limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: [...userKeys.byProject(projectIds.join(",")), limit],
    queryFn: ({ pageParam }) => getAllProjectUsers(projectIds, limit, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.cursor : undefined;
    },
    enabled: projectIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUsers = () => {
  const { allProjects } = useProjects();
  const projectUsers = useUsersByProjects(
    allProjects.map((project) => project.id),
  );

  const allProjectUsers = projectUsers.data?.pages.flatMap(page => page.data) ?? [];

  return {
    allProjectUsers,
    allProjectUsersLoading: projectUsers.isLoading,
    allProjectUsersError: projectUsers.error,
    refetchAllProjectUsers: projectUsers.refetch,
    hasNextPage: projectUsers.hasNextPage,
    fetchNextPage: projectUsers.fetchNextPage,
  };
};
