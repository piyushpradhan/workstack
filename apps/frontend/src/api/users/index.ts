import apiClient from "@/api/axios";
import type { User } from "@/api/users/types";

// The backend now returns { success: true, data: User[] }
// We extract the data array and wrap it in the expected format for backward compatibility
export const getAllProjectUsers = async (
  projectIds: string[],
): Promise<{ users: User[] }> => {
  const users = await apiClient.get<User[]>(
    `/users/projects/${projectIds.join(",")}`,
  );

  // Return in the format expected by the frontend
  return { users };
};
