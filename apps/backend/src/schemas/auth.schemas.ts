import { Type } from '@sinclair/typebox';
import { Static } from '@sinclair/typebox';
import { BaseSchemas, ResponseSchemas } from './base.js';

export const AuthRequestSchemas = {
    Register: Type.Object({
        name: Type.Optional(BaseSchemas.Name),
        email: BaseSchemas.Email,
        password: BaseSchemas.Password,
    }, {
        description: 'User registration request',
        additionalProperties: false,
    }),

    Login: Type.Object({
        email: BaseSchemas.Email,
        password: Type.String({
            minLength: 1,
            description: 'User password',
        }),
    }, {
        description: 'User login request',
        additionalProperties: false,
    }),

    RefreshToken: Type.Object({
        refreshToken: Type.String({
            minLength: 1,
            description: 'Valid refresh token',
        }),
    }, {
        description: 'Token refresh request',
        additionalProperties: false,
    }),

    PasswordResetRequest: Type.Object({
        email: BaseSchemas.Email,
    }, {
        description: 'Password reset request',
        additionalProperties: false,
    }),

    PasswordReset: Type.Object({
        token: Type.String({
            minLength: 1,
            description: 'Password reset token',
        }),
        password: BaseSchemas.Password,
    }, {
        description: 'Password reset confirmation',
        additionalProperties: false,
    }),

    ChangePassword: Type.Object({
        currentPassword: Type.String({
            minLength: 1,
            description: 'Current password',
        }),
        newPassword: BaseSchemas.Password,
    }, {
        description: 'Change password request',
        additionalProperties: false,
    }),

    Logout: Type.Object({
        sessionId: Type.Optional(Type.String({
            minLength: 1,
            description: 'Session ID to logout (optional - logs out all sessions if not provided)',
        })),
    }, {
        description: 'Logout request',
        additionalProperties: false,
    }),
};

const AuthUser = Type.Object({
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

const AuthSession = Type.Object({
    id: BaseSchemas.Id,
    userAgent: Type.Optional(Type.String()),
    ipAddress: Type.Optional(Type.String()),
    isActive: Type.Boolean(),
    expiresAt: BaseSchemas.Timestamp,
    createdAt: BaseSchemas.Timestamp,
    updatedAt: BaseSchemas.Timestamp,
}, {
    description: 'Session information',
});

export const AuthResponseSchemas = {
    User: AuthUser,

    LoginSuccess: Type.Object({
        accessToken: Type.String({
            description: 'JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        }),
        sessionId: Type.String({
            description: 'Session identifier',
            example: 'sess_1234567890abcdef',
        }),
        user: AuthUser,
    }, {
        description: 'Successful login response',
    }),

    RegisterSuccess: Type.Object({
        success: Type.Boolean({ default: true }),
        message: Type.String({ default: 'User registered successfully' }),
        user: AuthUser,
    }, {
        description: 'Successful registration response',
    }),

    Session: AuthSession,

    SessionsList: Type.Object({
        sessions: Type.Array(AuthSession),
        total: Type.Number({ minimum: 0 }),
    }, {
        description: 'List of user sessions',
    }),
};

export const AuthRouteSchemas = {
    Register: {
        description: 'Register a new user account',
        tags: ['Authentication'],
        summary: 'User Registration',
        body: AuthRequestSchemas.Register,
        response: {
            201: {
                description: 'User successfully created',
                ...AuthResponseSchemas.RegisterSuccess,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            409: {
                description: 'Conflict - user already exists',
                ...BaseSchemas.Error,
            },
        },
    },

    Login: {
        description: 'Authenticate user and get access token',
        tags: ['Authentication'],
        summary: 'User Login',
        body: AuthRequestSchemas.Login,
        response: {
            200: {
                description: 'Login successful',
                ...AuthResponseSchemas.LoginSuccess,
            },
            401: {
                description: 'Unauthorized - invalid credentials',
                type: 'string',
                example: 'Email or password is invalid',
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
        },
    },

    RefreshToken: {
        description: 'Refresh access token using refresh token',
        tags: ['Authentication'],
        summary: 'Refresh Token',
        body: AuthRequestSchemas.RefreshToken,
        response: {
            200: {
                description: 'Token refreshed successfully',
                ...AuthResponseSchemas.LoginSuccess,
            },
            401: {
                description: 'Unauthorized - invalid refresh token',
                ...BaseSchemas.Error,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
        },
    },

    Logout: {
        description: 'Logout user session(s)',
        tags: ['Authentication'],
        summary: 'User Logout',
        body: AuthRequestSchemas.Logout,
        response: {
            200: {
                description: 'Logout successful',
                ...ResponseSchemas.Success,
            },
            401: {
                description: 'Unauthorized - invalid token',
                ...BaseSchemas.Error,
            },
        },
    },

    GetSessions: {
        description: 'Get all active sessions for the authenticated user',
        tags: ['Authentication'],
        summary: 'Get User Sessions',
        response: {
            200: {
                description: 'Sessions retrieved successfully',
                ...AuthResponseSchemas.SessionsList,
            },
            401: {
                description: 'Unauthorized - invalid token',
                ...BaseSchemas.Error,
            },
        },
    },

    PasswordResetRequest: {
        description: 'Request password reset email',
        tags: ['Authentication'],
        summary: 'Request Password Reset',
        body: AuthRequestSchemas.PasswordResetRequest,
        response: {
            200: {
                description: 'Password reset email sent',
                ...ResponseSchemas.Success,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
        },
    },

    PasswordReset: {
        description: 'Reset password using token',
        tags: ['Authentication'],
        summary: 'Reset Password',
        body: AuthRequestSchemas.PasswordReset,
        response: {
            200: {
                description: 'Password reset successfully',
                ...ResponseSchemas.Success,
            },
            400: {
                description: 'Bad request - validation error or invalid token',
                ...BaseSchemas.Error,
            },
        },
    },

    ChangePassword: {
        description: 'Change user password',
        tags: ['Authentication'],
        summary: 'Change Password',
        body: AuthRequestSchemas.ChangePassword,
        response: {
            200: {
                description: 'Password changed successfully',
                ...ResponseSchemas.Success,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid current password',
                ...BaseSchemas.Error,
            },
        },
    },
};

export type RegisterRequest = Static<typeof AuthRequestSchemas.Register>;
export type LoginRequest = Static<typeof AuthRequestSchemas.Login>;
export type RefreshTokenRequest = Static<typeof AuthRequestSchemas.RefreshToken>;
export type PasswordResetRequest = Static<typeof AuthRequestSchemas.PasswordResetRequest>;
export type PasswordReset = Static<typeof AuthRequestSchemas.PasswordReset>;
export type ChangePasswordRequest = Static<typeof AuthRequestSchemas.ChangePassword>;
export type LogoutRequest = Static<typeof AuthRequestSchemas.Logout>;

export type UserResponse = Static<typeof AuthResponseSchemas.User>;
export type LoginSuccessResponse = Static<typeof AuthResponseSchemas.LoginSuccess>;
export type RegisterSuccessResponse = Static<typeof AuthResponseSchemas.RegisterSuccess>;
export type SessionResponse = Static<typeof AuthResponseSchemas.Session>;
export type SessionsListResponse = Static<typeof AuthResponseSchemas.SessionsList>;
