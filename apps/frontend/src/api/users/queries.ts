import { useQuery } from '@tanstack/react-query';
import { stateKeys } from '@/state';

import { getAllProjectUsers } from '@/api/users';
import { useProjects } from '../projects/queries';

export const userKeys = {
    all: stateKeys.users.all,
    details: stateKeys.users.details,
    detail: stateKeys.users.detail,
    byProject: stateKeys.users.byProject,
    byStatus: stateKeys.users.byStatus,
} as const;

export const useUsersByProjects = (projectIds: string[]) => {
    return useQuery({
        queryKey: userKeys.byProject(projectIds.join(',')),
        queryFn: () => getAllProjectUsers(projectIds),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    })
};

export const useUsers = () => {
    const { allProjects } = useProjects();
    const projectUsers = useUsersByProjects(allProjects.map(project => project.id));

    return {
        allProjectUsers: projectUsers.data?.users ?? [],
        allProjectUsersLoading: projectUsers.isLoading,
        allProjectUsersError: projectUsers.error,
        refetchAllProjectUsers: projectUsers.refetch,
    }
}