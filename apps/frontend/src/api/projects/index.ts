import apiClient from "@/api/axios";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/api/projects/types";
import type { CursorPaginatedResponse } from "@/api/types";

export const getAllProjects = async (
  limit?: number,
  cursor?: string
): Promise<CursorPaginatedResponse<Project>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

  const queryString = params.toString();

  return await apiClient.getCursorPaginated<Project>(
    `/projects${queryString ? `?${queryString}` : ""}`
  );
};

// Get projects owned by the current user
export const getUserProjects = async (): Promise<Array<Project>> => {
  return await apiClient.get<Array<Project>>("/projects/owned");
};

// Get a specific project by ID
export const getProjectById = async (id: string): Promise<Project> => {
  return await apiClient.get<Project>(`/projects/${id}`);
};

// Create a new project
export const createProject = async (
  project: CreateProjectRequest,
): Promise<Project> => {
  return await apiClient.post<Project>("/projects", project);
};

// Update an existing project
export const updateProject = async (
  id: string,
  project: UpdateProjectRequest,
): Promise<Project> => {
  return await apiClient.put<Project>(`/projects/${id}`, project);
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  return await apiClient.delete<void>(`/projects/${id}`);
};
