import apiClient from "@/api/axios";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/api/tasks/types";
import type { CursorPaginatedResponse } from "@/api/types";

export const getAllTasks = async (
  limit?: number,
  cursor?: string
): Promise<CursorPaginatedResponse<Task>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

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
