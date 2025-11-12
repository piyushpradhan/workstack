import apiClient from "@/api/axios";
import type { User, UserStats } from "@/api/users/types";
import type { ApiResponse, CursorPaginatedResponse } from "@/api/types";

// Get users by project IDs with cursor pagination
export const getAllProjectUsers = async (
  projectIds: string[],
  limit?: number,
  cursor?: string
): Promise<CursorPaginatedResponse<User>> => {
  const params = new URLSearchParams();

  if (limit) params.append("limit", limit.toString());
  if (cursor) params.append("cursor", cursor);

  const queryString = params.toString();

  return await apiClient.getCursorPaginated<User>(
    `/users/projects/${projectIds.join(",")}${queryString ? `?${queryString}` : ""}`
  );
};


export const getUserStats = async (): Promise<UserStats> => {
  return await apiClient.get<UserStats>("/users/stats");
}