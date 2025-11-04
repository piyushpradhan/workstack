export interface ProjectFilters {
    status?: string;
    userId?: string;
    search?: string;
    sortBy?: "name" | "createdAt" | "updatedAt" | "startDate" | "endDate" | "status";
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
}

export interface ProjectStats {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
}

