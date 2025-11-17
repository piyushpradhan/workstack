import apiClient from "@/api/axios";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/api/tasks/types";
import type { CursorPaginatedResponse } from "@/api/types";

export interface TaskFilters {
  search?: string;
  projectIds?: string[];
  statuses?: string[];
  priorities?: string[];
  assigneeIds?: string[];
}

export const getAllTasks = async (
  limit?: number,
  cursor?: string,
  filters?: TaskFilters
): Promise<CursorPaginatedResponse<Task>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

  if (filters) {
    if (filters.search) params.append("search", filters.search);
    if (filters.projectIds && filters.projectIds.length > 0) {
      filters.projectIds.forEach(id => params.append("projectIds", id));
    }
    if (filters.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(status => params.append("statuses", status));
    }
    if (filters.priorities && filters.priorities.length > 0) {
      filters.priorities.forEach(priority => params.append("priorities", priority));
    }
    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      filters.assigneeIds.forEach(id => params.append("assigneeIds", id));
    }
  }

  const queryString = params.toString();

  return await apiClient.getCursorPaginated<Task>(
    `/tasks${queryString ? `?${queryString}` : ""}`
  );
};

export const getTaskById = async (id: string): Promise<Task> => {
  return await apiClient.get<Task>(`/tasks/${id}`);
};

export const createTask = async (task: CreateTaskRequest): Promise<Task> => {
  return await apiClient.post<Task>("/tasks", task);
};

export const updateTask = async (
  id: string,
  task: UpdateTaskRequest,
): Promise<Task> => {
  return await apiClient.put<Task>(`/tasks/${id}`, task);
};

export const deleteTask = async (id: string): Promise<void> => {
  return await apiClient.delete<void>(`/tasks/${id}`);
};

export const getTasksByProject = async (
  projectId: string,
  limit?: number,
  cursor?: string
): Promise<CursorPaginatedResponse<Task>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

  const queryString = params.toString();

  return await apiClient.getCursorPaginated<Task>(
    `/tasks/project/${projectId}${queryString ? `?${queryString}` : ""}`
  );
};

export const getOwnedTasks = async (
  limit?: number,
  cursor?: string
): Promise<CursorPaginatedResponse<Task>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

  const queryString = params.toString();

  return await apiClient.getCursorPaginated<Task>(
    `/tasks/owned${queryString ? `?${queryString}` : ""}`
  );
};
