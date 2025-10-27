import type { User } from "@/api/auth/types";

export interface CreateProjectRequest {
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    ownerIds?: Array<string>;
    memberIds?: Array<string>;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    ownerIds?: Array<string>;
    memberIds?: Array<string>;
}


export interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    owners: Array<User>;
    members: Array<User>;
}