import { Type } from '@sinclair/typebox';
import { Static } from '@sinclair/typebox';
import { BaseSchemas, ResponseSchemas } from './base.js';

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
};

// Route schemas with full OpenAPI documentation
export const UserRouteSchemas = {
    GetCurrentUser: {
        description: 'Get current user details',
        tags: ['Users'],
        summary: 'Get Current User',
        security: [{ bearerAuth: [] }],
        response: {
            200: {
                description: 'Current user details retrieved successfully',
                ...UserResponseSchemas.UserProfile,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            500: {
                description: 'Internal server error',
                ...BaseSchemas.Error,
            },
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
            200: {
                description: 'User details retrieved successfully',
                ...UserResponseSchemas.User,
            },
            400: {
                description: 'Bad request - invalid user ID',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            404: {
                description: 'User not found',
                ...BaseSchemas.Error,
            },
            500: {
                description: 'Internal server error',
                ...BaseSchemas.Error,
            },
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
            200: {
                description: 'User details retrieved successfully',
                ...UserResponseSchemas.User,
            },
            400: {
                description: 'Bad request - invalid email',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            404: {
                description: 'User not found',
                ...BaseSchemas.Error,
            },
            500: {
                description: 'Internal server error',
                ...BaseSchemas.Error,
            },
        },
    },

    UpdateProfile: {
        description: 'Update current user profile',
        tags: ['Users'],
        summary: 'Update User Profile',
        security: [{ bearerAuth: [] }],
        body: UserRequestSchemas.UpdateProfile,
        response: {
            200: {
                description: 'Profile updated successfully',
                ...UserResponseSchemas.UserProfile,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            500: {
                description: 'Internal server error',
                ...BaseSchemas.Error,
            },
        },
    },

    ChangeEmail: {
        description: 'Change user email address',
        tags: ['Users'],
        summary: 'Change Email',
        security: [{ bearerAuth: [] }],
        body: UserRequestSchemas.ChangeEmail,
        response: {
            200: {
                description: 'Email change request sent successfully',
                ...ResponseSchemas.Success,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid password',
                ...BaseSchemas.Error,
            },
            409: {
                description: 'Conflict - email already exists',
                ...BaseSchemas.Error,
            },
            500: {
                description: 'Internal server error',
                ...BaseSchemas.Error,
            },
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
            200: {
                description: 'Users retrieved successfully',
                ...UserResponseSchemas.UserList,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            403: {
                description: 'Forbidden - admin access required',
                ...BaseSchemas.Error,
            },
            500: {
                description: 'Internal server error',
                ...BaseSchemas.Error,
            },
        },
    },
};

// TypeScript types
export type UpdateProfileRequest = Static<typeof UserRequestSchemas.UpdateProfile>;
export type ChangeEmailRequest = Static<typeof UserRequestSchemas.ChangeEmail>;
export type GetUserByIdRequest = Static<typeof UserRequestSchemas.GetUserById>;
export type GetUserByEmailRequest = Static<typeof UserRequestSchemas.GetUserByEmail>;

export type UserDetailsResponse = Static<typeof UserResponseSchemas.User>;
export type UserProfileResponse = Static<typeof UserResponseSchemas.UserProfile>;
export type UserListResponse = Static<typeof UserResponseSchemas.UserList>;