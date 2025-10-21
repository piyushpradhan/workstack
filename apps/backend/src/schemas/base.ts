import { Type } from '@sinclair/typebox';

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
        error: Type.String({
            description: 'Error message',
        }),
    }),
};

export const ResponseSchemas = {
    Success: Type.Object({
        success: Type.Boolean({ default: true }),
        message: Type.Optional(Type.String()),
    }),

    Pagination: Type.Object({
        page: Type.Number({ minimum: 1, default: 1 }),
        limit: Type.Number({ minimum: 1, maximum: 100, default: 10 }),
        total: Type.Number({ minimum: 0 }),
        totalPages: Type.Number({ minimum: 0 }),
    }),
};
