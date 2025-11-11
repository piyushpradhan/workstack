import { Type } from '@sinclair/typebox';
import type { TSchema } from '@sinclair/typebox';

export const BaseSchemas = {
    Id: Type.String({
        format: 'uuid',
        description: 'Unique identifier',
    }),

    Email: Type.String({
        format: 'email',
        minLength: 5,
        maxLength: 255,
        description: 'Valid email address',
    }),

    Password: Type.String({
        minLength: 8,
        maxLength: 128,
        description: 'Password with at least 8 characters',
    }),

    Name: Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'User display name',
    }),

    Timestamp: Type.String({
        format: 'date-time',
        description: 'ISO 8601 timestamp',
    }),

    Error: Type.Object({
        success: Type.Literal(false),
        message: Type.String({
            description: 'Error message',
        }),
        error: Type.String({
            description: 'Error code or type',
        }),
    }),
};

/**
 * Creates a standardized success response schema
 */
export const createSuccessResponse = <T extends TSchema>(dataSchema: T, description?: string) => {
    return Type.Object({
        success: Type.Literal(true),
        data: dataSchema,
        message: Type.Optional(Type.String({
            description: 'Success message',
        })),
    }, {
        description: description || 'Successful response',
    });
};

/**
 * Creates a standardized success response schema for arrays
 */
export const createArrayResponse = <T extends TSchema>(itemSchema: T, description?: string) => {
    return Type.Object({
        success: Type.Literal(true),
        data: Type.Array(itemSchema),
        message: Type.Optional(Type.String({
            description: 'Success message',
        })),
    }, {
        description: description || 'Successful array response',
    });
};

/**
 * Creates a standardized paginated response schema
 */
export const createPaginatedResponse = <T extends TSchema>(itemSchema: T, description?: string) => {
    return Type.Object({
        success: Type.Literal(true),
        data: Type.Array(itemSchema),
        message: Type.Optional(Type.String({
            description: 'Success message',
        })),
        meta: Type.Object({
            page: Type.Number({ minimum: 1 }),
            limit: Type.Number({ minimum: 1 }),
            total: Type.Number({ minimum: 0 }),
            totalPages: Type.Number({ minimum: 0 }),
            hasNextPage: Type.Boolean(),
            hasPreviousPage: Type.Boolean(),
        }),
    }, {
        description: description || 'Paginated response',
    });
};

/**
 * Creates a standardized cursor-paginated response schema
 */
export const createCursorPaginatedResponse = <T extends TSchema>(itemSchema: T, description?: string) => {
    return Type.Object({
        success: Type.Literal(true),
        data: Type.Array(itemSchema),
        message: Type.Optional(Type.String({
            description: 'Success message',
        })),
        cursor: Type.Optional(Type.String({
            description: 'Cursor for next page',
        })),
        meta: Type.Object({
            hasNextPage: Type.Boolean(),
            hasPreviousPage: Type.Boolean(),
        }),
    }, {
        description: description || 'Cursor-paginated response',
    });
};

export const ResponseSchemas = {
    Success: Type.Object({
        success: Type.Literal(true),
        message: Type.Optional(Type.String()),
        data: Type.Optional(Type.Null()),
    }),

    Error: BaseSchemas.Error,

    Pagination: Type.Object({
        page: Type.Number({ minimum: 1, default: 1 }),
        limit: Type.Number({ minimum: 1, maximum: 100, default: 10 }),
        total: Type.Number({ minimum: 0 }),
        totalPages: Type.Number({ minimum: 0 }),
        hasNextPage: Type.Boolean(),
        hasPreviousPage: Type.Boolean(),
    }),
};
