import { queryClient } from "@/api/queryClient";
import { stateKeys } from "@/state/utils";
import type { Task } from "@/state/tasks/types";

export interface TaskFilters {
    projectId?: string;
    status?: string;
    priority?: string;
    userId?: string;
    dueDate?: string;
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface TaskStats {
    total: number;
    completed: number;
    inProgress: number;
    inReview: number;
    cancelled: number;
    overdue: number;
}

export class TaskStateManager {
    constructor() { }

    getAllTasks(): Task[] {
        return queryClient.getQueryData<Task[]>(stateKeys.tasks.all) ?? [];
    }

    getTaskById(id: string): Task | null {
        return queryClient.getQueryData<Task>(stateKeys.tasks.detail(id)) ?? null;
    }

    getTasksByProjectId(projectId: string): Task[] {
        return queryClient.getQueryData<Task[]>(stateKeys.tasks.byProject(projectId)) ?? [];
    }

    getTasksByUserId(userId: string): Task[] {
        return queryClient.getQueryData<Task[]>(stateKeys.tasks.byUser(userId)) ?? [];
    }

    getTasksByStatus(status: string): Task[] {
        return queryClient.getQueryData<Task[]>(stateKeys.tasks.byStatus(status)) ?? [];
    }

    getTasksByPriority(priority: string): Task[] {
        return queryClient.getQueryData<Task[]>(stateKeys.tasks.byPriority(priority)) ?? [];
    }

    getTasksBySearch(search: string): Task[] {
        return queryClient.getQueryData<Task[]>(stateKeys.tasks.search(search)) ?? [];
    }
}

export const taskManager = new TaskStateManager();