import apiClient from "@/api/axios"
import type { UsersResponse } from "@/api/users/types"

export const getAllProjectUsers = async (projectIds: string[]): Promise<UsersResponse> => {
    return await apiClient.get<UsersResponse>(`/users/projects/${projectIds.join(',')}`)
}