import { Type } from '@sinclair/typebox';
import { Static } from '@sinclair/typebox';
import { BaseSchemas, ResponseSchemas, createSuccessResponse, createArrayResponse, createCursorPaginatedResponse } from './base.js';

// Base user schemas
const User = Type.Object({
    id: BaseSchemas.Id,
    name: Type.String(),
    email: BaseSchemas.Email,
    avatar: Type.Optional(Type.String()),
    role: Type.Union([
        Type.Literal('ADMIN'),
        Type.Literal('MANAGER'),
        Type.Literal('MEMBER'),
        Type.Literal('VIEWER'),
    ]),
    isActive: Type.Boolean(),
    createdAt: BaseSchemas.Timestamp,
    updatedAt: BaseSchemas.Timestamp,
    lastLoginAt: Type.Optional(BaseSchemas.Timestamp),
    emailVerifiedAt: Type.Optional(BaseSchemas.Timestamp),
}, {
    description: 'User information',
});

export const UserSchemas = {
    User,
};

// Request schemas
export const UserRequestSchemas = {
    UpdateProfile: Type.Object({
        name: Type.Optional(Type.String({
            minLength: 1,
            maxLength: 100,
            description: 'User display name',
        })),
        email: Type.Optional(BaseSchemas.Email),
        avatar: Type.Optional(Type.String({
            description: 'User avatar URL',
        })),
    }, {
        description: 'Update user profile request',
        additionalProperties: false,
    }),

    ChangeEmail: Type.Object({
        newEmail: BaseSchemas.Email,
        password: Type.String({
            minLength: 1,
            description: 'Current password for verification',
        }),
    }, {
        description: 'Change email request',
        additionalProperties: false,
    }),

    GetUserById: Type.Object({
        id: BaseSchemas.Id,
    }, {
        description: 'Get user by ID request',
        additionalProperties: false,
    }),

    GetUserByEmail: Type.Object({
        email: BaseSchemas.Email,
    }, {
        description: 'Get user by email request',
        additionalProperties: false,
    }),
};

// Response schemas
export const UserResponseSchemas = {
    User,

    UserProfile: Type.Object({
        id: BaseSchemas.Id,
        name: Type.String(),
        email: BaseSchemas.Email,
        avatar: Type.Optional(Type.String()),
        role: Type.Union([
            Type.Literal('ADMIN'),
            Type.Literal('MANAGER'),
            Type.Literal('MEMBER'),
            Type.Literal('VIEWER'),
        ]),
        isActive: Type.Boolean(),
        createdAt: BaseSchemas.Timestamp,
        updatedAt: BaseSchemas.Timestamp,
        lastLoginAt: Type.Optional(BaseSchemas.Timestamp),
        emailVerifiedAt: Type.Optional(BaseSchemas.Timestamp),
    }, {
        description: 'User profile information',
    }),

    UserList: Type.Object({
        users: Type.Array(User),
        total: Type.Number({ minimum: 0 }),
        page: Type.Number({ minimum: 1 }),
        limit: Type.Number({ minimum: 1 }),
    }, {
        description: 'List of users with pagination',
    }),

    UserStats: Type.Object({
        activeProjects: Type.Number({ minimum: 0 }),
        myTasks: Type.Number({ minimum: 0 }),
        overdueTasks: Type.Number({ minimum: 0 }),
        completedTasks: Type.Number({ minimum: 0 }),
    }, {
        description: 'User stats for projects and tasks',
    }),
};

// Route schemas with full OpenAPI documentation
export const UserRouteSchemas = {
    GetCurrentUser: {
        description: 'Get current user details',
        tags: ['Users'],
        summary: 'Get Current User',
        security: [{ bearerAuth: [] }],
        response: {
            200: createSuccessResponse(UserResponseSchemas.UserProfile, 'Current user details retrieved successfully'),
            401: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    GetUserById: {
        description: 'Get user details by ID',
        tags: ['Users'],
        summary: 'Get User by ID',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
            id: BaseSchemas.Id,
        }),
        response: {
            200: createSuccessResponse(UserResponseSchemas.User, 'User details retrieved successfully'),
            400: BaseSchemas.Error,
            401: BaseSchemas.Error,
            404: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    GetUserByEmail: {
        description: 'Get user details by email',
        tags: ['Users'],
        summary: 'Get User by Email',
        security: [{ bearerAuth: [] }],
        querystring: Type.Object({
            email: BaseSchemas.Email,
        }),
        response: {
            200: createSuccessResponse(UserResponseSchemas.User, 'User details retrieved successfully'),
            400: BaseSchemas.Error,
            401: BaseSchemas.Error,
            404: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    UpdateProfile: {
        description: 'Update current user profile',
        tags: ['Users'],
        summary: 'Update User Profile',
        security: [{ bearerAuth: [] }],
        body: UserRequestSchemas.UpdateProfile,
        response: {
            200: createSuccessResponse(UserResponseSchemas.UserProfile, 'Profile updated successfully'),
            400: BaseSchemas.Error,
            401: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    ChangeEmail: {
        description: 'Change user email address',
        tags: ['Users'],
        summary: 'Change Email',
        security: [{ bearerAuth: [] }],
        body: UserRequestSchemas.ChangeEmail,
        response: {
            200: ResponseSchemas.Success,
            400: BaseSchemas.Error,
            401: BaseSchemas.Error,
            409: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    ListUsers: {
        description: 'Get list of users (admin only)',
        tags: ['Users'],
        summary: 'List Users',
        security: [{ bearerAuth: [] }],
        querystring: Type.Object({
            page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
            limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
            search: Type.Optional(Type.String({ description: 'Search by name or email' })),
            role: Type.Optional(Type.Union([
                Type.Literal('ADMIN'),
                Type.Literal('MANAGER'),
                Type.Literal('MEMBER'),
                Type.Literal('VIEWER'),
            ])),
        }),
        response: {
            200: createArrayResponse(UserResponseSchemas.User, 'Users retrieved successfully'),
            401: BaseSchemas.Error,
            403: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    GetUsersByProjects: {
        description: "Get users that are involved in certain projects",
        tags: ["Users", "Projects"],
        summary: "Get users involved in certain projects",
        security: [{ bearerAuth: [] }],
        params: Type.Object({
            projectIds: Type.String({ description: "Comma separated list of project IDs" }),
        }),
        querystring: Type.Object({
            limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10, description: "Number of items per page" })),
            cursor: Type.Optional(Type.String({ description: "Cursor for pagination" })),
        }),
        response: {
            200: createCursorPaginatedResponse(UserResponseSchemas.User, "Users retrieved successfully"),
            401: BaseSchemas.Error,
            403: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    },

    GetUserStats: {
        description: "Get user stats",
        tags: ["users", "projects", "tasks"],
        summary: "Get user stats for projects and tasks",
        security: [{ bearerAuth: [] }],
        response: {
            200: createSuccessResponse(UserResponseSchemas.UserStats, "User stats retrieved successfully"),
            401: BaseSchemas.Error,
            500: BaseSchemas.Error,
        },
    }
};

// TypeScript types
export type UpdateProfileRequest = Static<typeof UserRequestSchemas.UpdateProfile>;
export type ChangeEmailRequest = Static<typeof UserRequestSchemas.ChangeEmail>;
export type GetUserByIdRequest = Static<typeof UserRequestSchemas.GetUserById>;
export type GetUserByEmailRequest = Static<typeof UserRequestSchemas.GetUserByEmail>;

export type UserDetailsResponse = Static<typeof UserResponseSchemas.User>;
export type UserProfileResponse = Static<typeof UserResponseSchemas.UserProfile>;
export type UserListResponse = Static<typeof UserResponseSchemas.UserList>;