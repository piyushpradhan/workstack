import apiClient from "@/api/axios";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/api/projects/types";
import type { CursorPaginatedResponse } from "@/api/types";

export interface ProjectFilters {
  search?: string;
  statuses?: string[];
  sort?: Record<string, string>;
}

export const getAllProjects = async (
  limit?: number,
  cursor?: string,
  filters?: ProjectFilters
): Promise<CursorPaginatedResponse<Project>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);
  
  if (filters?.search) {
    params.append("filters", `search:${filters.search}`);
  }
  
  if (filters?.statuses && filters.statuses.length > 0) {
    filters.statuses.forEach((status) => {
      params.append("filters", `status:${status}`);
    });
  }
  
  if (filters?.sort && Object.keys(filters.sort).length > 0) {
    const sortString = Object.entries(filters.sort)
      .map(([key, value]) => `${key}:${value}`)
      .join(",");
    params.append("sort", sortString);
  }

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
