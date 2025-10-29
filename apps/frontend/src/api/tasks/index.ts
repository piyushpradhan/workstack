import apiClient from "@/api/axios";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "@/api/tasks/types";

export const getAllTasks = async (): Promise<Task[]> => {
    return await apiClient.get<Task[]>('/tasks');
}

export const getTaskById = async (id: string): Promise<Task> => {
    return await apiClient.get<Task>(`/tasks/${id}`);
}

export const createTask = async (task: CreateTaskRequest): Promise<Task> => {
    return await apiClient.post<Task>('/tasks', task);
}

export const updateTask = async (id: string, task: UpdateTaskRequest): Promise<Task> => {
    return await apiClient.put<Task>(`/tasks/${id}`, task);
}

export const deleteTask = async (id: string): Promise<void> => {
    return await apiClient.delete<void>(`/tasks/${id}`);
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
    return await apiClient.get<Task[]>(`/tasks/project/${projectId}`);
}

export const getOwnedTasks = async (): Promise<Task[]> => {
    return await apiClient.get<Task[]>('/tasks/owned');
}