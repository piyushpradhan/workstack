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
            // Cancel all outgoing queries to prevent race conditions
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            await queryClient.cancelQueries({ queryKey: taskKeys.byProject(newTaskData.projectId) });
            await queryClient.cancelQueries({ queryKey: taskKeys.myTasks() });

            // Snapshot previous values for rollback
            const previousAllTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());
            const previousProjectTasks = queryClient.getQueryData<Task[]>(
                taskKeys.byProject(newTaskData.projectId)
            );
            const previousMyTasks = queryClient.getQueryData<Task[]>(taskKeys.myTasks());

            // Create optimistic task
            const tempId = `temp-${Date.now()}`;
            const optimisticTask: Task = {
                id: tempId,
                ...newTaskData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Optimistically update all task lists
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (old) => [...(old ?? []), optimisticTask]);
            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(newTaskData.projectId),
                (old) => [...(old ?? []), optimisticTask]
            );

            // Update myTasks if the task is assigned to current user
            if (newTaskData.ownerId) {
                queryClient.setQueryData<Task[]>(taskKeys.myTasks(), (old) =>
                    old ? [...old, optimisticTask] : [optimisticTask]
                );
            }

            return {
                previousAllTasks,
                previousProjectTasks,
                previousMyTasks,
                projectId: newTaskData.projectId,
                tempId
            };
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousAllTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousAllTasks);
            }
            if (context?.previousProjectTasks && context.projectId) {
                queryClient.setQueryData(
                    taskKeys.byProject(context.projectId),
                    context.previousProjectTasks
                );
            }
            if (context?.previousMyTasks) {
                queryClient.setQueryData(taskKeys.myTasks(), context.previousMyTasks);
            }
        },
        onSuccess: (newTask: Task, _variables, context) => {
            // Replace optimistic task with real one
            queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);

            // Update all lists with the real task
            queryClient.setQueryData<Task[]>(taskKeys.lists(), (old) =>
                old?.map(task => task.id === context?.tempId || task.id === newTask.id ? newTask : task) ?? []
            );

            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(newTask.projectId),
                (old) => old?.map(task => task.id === context?.tempId || task.id === newTask.id ? newTask : task) ?? []
            );

            if (newTask.ownerId) {
                queryClient.setQueryData<Task[]>(taskKeys.myTasks(), (old) =>
                    old?.map(task => task.id === context?.tempId || task.id === newTask.id ? newTask : task) ?? []
                );
            }
        },
        onSettled: () => {
            // Invalidate to ensure consistency
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
            // Cancel all outgoing queries to prevent race conditions
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            await queryClient.cancelQueries({ queryKey: taskKeys.myTasks() });

            const currentTask = queryClient.getQueryData<Task>(taskKeys.detail(id));
            if (!currentTask) return null;

            const projectId = currentTask.projectId;
            await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });

            const previousAllTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());
            const previousProjectTasks = queryClient.getQueryData<Task[]>(
                taskKeys.byProject(projectId)
            );
            const previousMyTasks = queryClient.getQueryData<Task[]>(taskKeys.myTasks());
            const previousTask = currentTask;

            const optimisticTask = { ...currentTask, ...data, updatedAt: new Date().toISOString() };

            queryClient.setQueryData<Task>(taskKeys.detail(id), optimisticTask);
            queryClient.setQueryData<Task[]>(
                taskKeys.lists(),
                (old) => old?.map(task => task.id === id ? optimisticTask : task) ?? []
            );
            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(projectId),
                (old) => old?.map(task => task.id === id ? optimisticTask : task) ?? []
            );

            // Update myTasks if task is assigned to someone
            if (currentTask.ownerId) {
                queryClient.setQueryData<Task[]>(
                    taskKeys.myTasks(),
                    (old) => old?.map(task => task.id === id ? optimisticTask : task) ?? []
                );
            }

            return {
                previousAllTasks,
                previousProjectTasks,
                previousMyTasks,
                projectId,
                previousTask
            };
        },
        onError: (_error, variables, context) => {
            // Rollback on error
            if (context?.previousAllTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousAllTasks);
            }
            if (context?.previousProjectTasks && context.projectId) {
                queryClient.setQueryData(
                    taskKeys.byProject(context.projectId),
                    context.previousProjectTasks
                );
            }
            if (context?.previousMyTasks) {
                queryClient.setQueryData(taskKeys.myTasks(), context.previousMyTasks);
            }
            if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(variables.id), context.previousTask);
            }
        },
        onSuccess: (updatedTask: Task) => {
            // Replace optimistic updates with real data
            queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);

            // Update all lists with the real task
            queryClient.setQueryData<Task[]>(
                taskKeys.lists(),
                (old) => old?.map(task => task.id === updatedTask.id ? updatedTask : task) ?? []
            );
            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(updatedTask.projectId),
                (old) => old?.map(task => task.id === updatedTask.id ? updatedTask : task) ?? []
            );

            if (updatedTask.ownerId) {
                queryClient.setQueryData<Task[]>(
                    taskKeys.myTasks(),
                    (old) => old?.map(task => task.id === updatedTask.id ? updatedTask : task) ?? []
                );
            }
        },
        onSettled: () => {
            // Invalidate to ensure consistency
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
            // Cancel all outgoing queries to prevent race conditions
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(deletedTaskId) });
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
            await queryClient.cancelQueries({ queryKey: taskKeys.myTasks() });

            const currentTask = queryClient.getQueryData<Task>(taskKeys.detail(deletedTaskId));
            if (!currentTask) return null;

            const projectId = currentTask.projectId;
            await queryClient.cancelQueries({ queryKey: taskKeys.byProject(projectId) });

            // Snapshot previous values for rollback
            const previousAllTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());
            const previousProjectTasks = queryClient.getQueryData<Task[]>(
                taskKeys.byProject(projectId)
            );
            const previousMyTasks = queryClient.getQueryData<Task[]>(taskKeys.myTasks());
            const deletedTask = currentTask;

            // Optimistically remove task from all lists
            queryClient.setQueryData<Task[]>(
                taskKeys.lists(),
                (old) => old?.filter(task => task.id !== deletedTaskId) ?? []
            );
            queryClient.setQueryData<Task[]>(
                taskKeys.byProject(projectId),
                (old) => old?.filter(task => task.id !== deletedTaskId) ?? []
            );

            // Remove from myTasks if applicable
            if (currentTask.ownerId) {
                queryClient.setQueryData<Task[]>(
                    taskKeys.myTasks(),
                    (old) => old?.filter(task => task.id !== deletedTaskId) ?? []
                );
            }

            return {
                previousAllTasks,
                previousProjectTasks,
                previousMyTasks,
                projectId,
                deletedTask
            };
        },
        onError: (_error, deletedTaskId, context) => {
            // Rollback on error
            if (context?.previousAllTasks) {
                queryClient.setQueryData(taskKeys.lists(), context.previousAllTasks);
            }
            if (context?.previousProjectTasks && context.projectId && context.deletedTask) {
                queryClient.setQueryData(
                    taskKeys.byProject(context.projectId),
                    context.previousProjectTasks
                );
                queryClient.setQueryData(taskKeys.detail(deletedTaskId), context.deletedTask);
            }
            if (context?.previousMyTasks) {
                queryClient.setQueryData(taskKeys.myTasks(), context.previousMyTasks);
            }
        },
        onSuccess: (_data, deletedTaskId) => {
            // Remove the detail query
            queryClient.removeQueries({ queryKey: taskKeys.detail(deletedTaskId) });
        },
        onSettled: () => {
            // Invalidate to ensure consistency
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
