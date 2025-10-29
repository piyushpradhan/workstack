import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stateKeys } from '@/state';
import type { UpdateTaskRequest, Task } from '@/api/tasks/types';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTasksByProject,
    getOwnedTasks
} from '@/api/tasks';

export const taskKeys = {
    all: stateKeys.tasks.all,
    lists: stateKeys.tasks.lists,
    list: stateKeys.tasks.list,
    details: stateKeys.tasks.details,
    detail: stateKeys.tasks.detail,
    byProject: stateKeys.tasks.byProject,
    byStatus: stateKeys.tasks.byStatus,
    byPriority: stateKeys.tasks.byPriority,
    byUser: stateKeys.tasks.byUser,
    myTasks: stateKeys.tasks.myTasks,
    overdue: stateKeys.tasks.overdue,
    dueToday: stateKeys.tasks.dueToday,
    dueThisWeek: stateKeys.tasks.dueThisWeek,
    completed: stateKeys.tasks.completed,
    recent: stateKeys.tasks.recent,
    dependencies: stateKeys.tasks.dependencies,
    dependents: stateKeys.tasks.dependents,
    stats: stateKeys.tasks.stats,
    search: stateKeys.tasks.search,
} as const;

export const useAllTasks = () => {
    return useQuery({
        queryKey: taskKeys.lists(),
        queryFn: getAllTasks,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};

export const useTask = (id: string) => {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => getTaskById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};

export const useTasksByProject = (projectId: string) => {
    return useQuery({
        queryKey: taskKeys.byProject(projectId),
        queryFn: () => getTasksByProject(projectId),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};

export const useOwnedTasks = () => {
    return useQuery({
        queryKey: taskKeys.myTasks(),
        queryFn: getOwnedTasks,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTask,
        onMutate: async (newTaskData) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.byProject(newTaskData.projectId) });

            const previousProjectTasks = queryClient.getQueryData<Task[]>(
                taskKeys.byProject(newTaskData.projectId)
            );

            const tempId = `temp-${Date.now()}`;
            const optimisticTask: Task = {
                id: tempId,
                ...newTaskData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(newTaskData.projectId),
                (old) => [...(old ?? []), optimisticTask]
            );

            return { previousProjectTasks, projectId: newTaskData.projectId, tempId };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousProjectTasks && context.projectId) {
                queryClient.setQueryData(
                    taskKeys.byProject(context.projectId),
                    context.previousProjectTasks
                );
            }
        },
        onSuccess: (newTask: Task) => {
            queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);
            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(newTask.projectId),
                (old) => old?.map(task => task.id.startsWith('temp-') ? newTask : task) ?? []
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: taskKeys.all,
        mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
            updateTask(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });

            const currentTask = queryClient.getQueryData<Task>(taskKeys.detail(id));
            if (!currentTask) return null;

            const projectId = currentTask.projectId;
            await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });

            const previousProjectTasks = queryClient.getQueryData<Task[]>(
                taskKeys.byProject(projectId)
            );

            if (previousProjectTasks) {
                const optimisticTask = { ...currentTask, ...data };
                queryClient.setQueryData<Task[]>(
                    taskKeys.byProject(projectId),
                    (old) => old?.map(task => task.id === id ? optimisticTask : task) ?? []
                );
                queryClient.setQueryData<Task>(taskKeys.detail(id), optimisticTask);
            }

            return { previousProjectTasks, projectId, previousTask: currentTask };
        },
        onError: (_error, variables, context) => {
            if (context?.previousProjectTasks && context.projectId) {
                queryClient.setQueryData(
                    taskKeys.byProject(context.projectId),
                    context.previousProjectTasks
                );
            }
            if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(variables.id), context.previousTask);
            }
        },
        onSuccess: (updatedTask: Task) => {
            queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(updatedTask.projectId),
                (old) => old?.map(task => task.id === updatedTask.id ? updatedTask : task) ?? []
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTask,
        onMutate: async (deletedTaskId) => {
            const currentTask = queryClient.getQueryData<Task>(taskKeys.detail(deletedTaskId));
            if (!currentTask) return null;

            const projectId = currentTask.projectId;
            await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });

            const previousProjectTasks = queryClient.getQueryData<Task[]>(
                taskKeys.byProject(projectId)
            );

            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(projectId),
                (old) => old?.filter(task => task.id !== deletedTaskId) ?? []
            );

            return { previousProjectTasks, projectId, deletedTask: currentTask };
        },
        onError: (_error, deletedTaskId, context) => {
            if (context?.previousProjectTasks && context.projectId && context.deletedTask) {
                queryClient.setQueryData(
                    taskKeys.byProject(context.projectId),
                    context.previousProjectTasks
                );
                queryClient.setQueryData(taskKeys.detail(deletedTaskId), context.deletedTask);
            }
        },
        onSuccess: (_data, deletedTaskId) => {
            queryClient.removeQueries({ queryKey: taskKeys.detail(deletedTaskId) });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: taskKeys.myTasks() });
        },
    });
};

export const useTasks = () => {
    const allTasksQuery = useAllTasks();
    const ownedTasksQuery = useOwnedTasks();
    const createMutation = useCreateTask();
    const updateMutation = useUpdateTask();
    const deleteMutation = useDeleteTask();

    return {
        allTasks: allTasksQuery.data ?? [],
        ownedTasks: ownedTasksQuery.data ?? [],
        myTasks: ownedTasksQuery.data ?? [],

        isLoadingAll: allTasksQuery.isLoading,
        isLoadingOwned: ownedTasksQuery.isLoading,
        isLoadingMy: ownedTasksQuery.isLoading,
        isLoading: allTasksQuery.isLoading,

        allTasksError: allTasksQuery.error,
        ownedTasksError: ownedTasksQuery.error,
        myTasksError: ownedTasksQuery.error,

        createTask: createMutation.mutate,
        updateTask: updateMutation.mutate,
        deleteTask: deleteMutation.mutate,

        createTaskAsync: createMutation.mutateAsync,
        updateTaskAsync: updateMutation.mutateAsync,
        deleteTaskAsync: deleteMutation.mutateAsync,

        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,

        createError: createMutation.error,
        updateError: updateMutation.error,
        deleteError: deleteMutation.error,

        refetchAll: allTasksQuery.refetch,
        refetchOwned: ownedTasksQuery.refetch,
        refetchMy: ownedTasksQuery.refetch,
        refetch: allTasksQuery.refetch,
    };
};

export const useTaskStats = () => {
    const allTasksQuery = useAllTasks();
    const ownedTasksQuery = useOwnedTasks();

    const allTasks = allTasksQuery.data ?? [];
    const ownedTasks = ownedTasksQuery.data ?? [];

    return {
        total: allTasks.length,
        owned: ownedTasks.length,
        completed: allTasks.filter(task => task.status === 'DONE').length,
        inProgress: allTasks.filter(task => task.status === 'IN_PROGRESS').length,
        todo: allTasks.filter(task => task.status === 'TODO').length,
        inReview: allTasks.filter(task => task.status === 'IN_REVIEW').length,
        cancelled: allTasks.filter(task => task.status === 'CANCELLED').length,
        overdue: allTasks.filter(task =>
            task.dueDate &&
            new Date(task.dueDate) < new Date() &&
            task.status !== 'DONE'
        ).length,
        isLoading: allTasksQuery.isLoading || ownedTasksQuery.isLoading,
        error: allTasksQuery.error || ownedTasksQuery.error,
    };
};
