/**
 * Standardized API response types matching the backend format
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    cursor?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
    };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface CursorPaginatedResponse<T> extends ApiResponse<T[]> {
    data: T[];
    cursor?: string;
    meta: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

