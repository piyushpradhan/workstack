import { Type } from '@sinclair/typebox';
import { Static } from '@sinclair/typebox';
import { BaseSchemas, ResponseSchemas } from './base.js';

// Base entity schemas
const ProjectUser = Type.Object({
    id: BaseSchemas.Id,
    email: BaseSchemas.Email,
    name: Type.Optional(Type.String()),
}, {
    description: 'User information',
});

const ProjectOwner = Type.Object({
    user: ProjectUser,
}, {
    description: 'Project owner information',
});

const ProjectMember = Type.Object({
    user: ProjectUser,
}, {
    description: 'Project member information',
});

export const ProjectSchemas = {
    User: ProjectUser,
    ProjectOwner,
    ProjectMember,

    Project: Type.Object({
        id: Type.String({
            minLength: 1,
            description: 'Unique identifier'
        }),
        name: Type.String({ minLength: 1, maxLength: 255 }),
        description: Type.Optional(Type.String({ maxLength: 1000 })),
        status: Type.Union([
            Type.Literal('PLANNING'),
            Type.Literal('ACTIVE'),
            Type.Literal('ON_HOLD'),
            Type.Literal('COMPLETED'),
            Type.Literal('CANCELLED'),
        ]),
        startDate: Type.Optional(BaseSchemas.Timestamp),
        endDate: Type.Optional(BaseSchemas.Timestamp),
        createdAt: BaseSchemas.Timestamp,
        updatedAt: BaseSchemas.Timestamp,
    }, {
        description: 'Project information',
    }),

    ProjectWithRelations: Type.Object({
        id: Type.String({
            minLength: 1,
            description: 'Unique identifier'
        }),
        name: Type.String(),
        description: Type.Optional(Type.String()),
        status: Type.Union([
            Type.Literal('PLANNING'),
            Type.Literal('ACTIVE'),
            Type.Literal('ON_HOLD'),
            Type.Literal('COMPLETED'),
            Type.Literal('CANCELLED'),
        ]),
        startDate: Type.Optional(BaseSchemas.Timestamp),
        endDate: Type.Optional(BaseSchemas.Timestamp),
        createdAt: BaseSchemas.Timestamp,
        updatedAt: BaseSchemas.Timestamp,
        owners: Type.Array(ProjectOwner),
        members: Type.Array(ProjectMember),
    }, {
        description: 'Project with relationships',
    }),

    ProjectWithOwners: Type.Object({
        id: Type.String({
            minLength: 1,
            description: 'Unique identifier'
        }),
        name: Type.String(),
        description: Type.Optional(Type.String()),
        status: Type.Union([
            Type.Literal('PLANNING'),
            Type.Literal('ACTIVE'),
            Type.Literal('ON_HOLD'),
            Type.Literal('COMPLETED'),
            Type.Literal('CANCELLED'),
        ]),
        startDate: Type.Optional(BaseSchemas.Timestamp),
        endDate: Type.Optional(BaseSchemas.Timestamp),
        createdAt: BaseSchemas.Timestamp,
        updatedAt: BaseSchemas.Timestamp,
        owners: Type.Array(ProjectOwner),
    }, {
        description: 'Project with owners only',
    }),

    ProjectWithUsers: Type.Object({
        id: Type.String({
            minLength: 1,
            description: 'Unique identifier'
        }),
        name: Type.String(),
        description: Type.Optional(Type.String()),
        status: Type.Union([
            Type.Literal('PLANNING'),
            Type.Literal('ACTIVE'),
            Type.Literal('ON_HOLD'),
            Type.Literal('COMPLETED'),
            Type.Literal('CANCELLED'),
        ]),
        startDate: Type.Optional(BaseSchemas.Timestamp),
        endDate: Type.Optional(BaseSchemas.Timestamp),
        createdAt: BaseSchemas.Timestamp,
        updatedAt: BaseSchemas.Timestamp,
        owners: Type.Array(ProjectUser),
        members: Type.Array(ProjectUser),
    }, {
        description: 'Project with users',
    }),
};

export const ProjectRequestSchemas = {
    CreateProject: Type.Object({
        name: Type.String({
            minLength: 1,
            maxLength: 255,
            description: 'Project name',
        }),
        description: Type.Optional(Type.String({
            maxLength: 1000,
            description: 'Project description',
        })),
        startDate: Type.Optional(BaseSchemas.Timestamp),
        endDate: Type.Optional(BaseSchemas.Timestamp),
    }, {
        description: 'Create project request',
        additionalProperties: false,
    }),

    UpdateProject: Type.Object({
        name: Type.Optional(Type.String({
            minLength: 1,
            maxLength: 255,
            description: 'Project name',
        })),
        description: Type.Optional(Type.String({
            maxLength: 1000,
            description: 'Project description',
        })),
        status: Type.Optional(Type.Union([
            Type.Literal('PLANNING'),
            Type.Literal('ACTIVE'),
            Type.Literal('ON_HOLD'),
            Type.Literal('COMPLETED'),
            Type.Literal('CANCELLED'),
        ])),
        startDate: Type.Optional(BaseSchemas.Timestamp),
        endDate: Type.Optional(BaseSchemas.Timestamp),
    }, {
        description: 'Update project request',
        additionalProperties: false,
    }),

    AddProjectMember: Type.Object({
        userId: BaseSchemas.Id,
        role: Type.Optional(Type.Union([
            Type.Literal('OWNER'),
            Type.Literal('MEMBER'),
        ])),
    }, {
        description: 'Add project member request',
        additionalProperties: false,
    }),
};

export const ProjectRouteSchemas = {
    ListProjects: {
        description: 'Get all projects for the authenticated user',
        tags: ['Projects'],
        summary: 'List User Projects',
        security: [{ bearerAuth: [] }],
        response: {
            200: {
                description: 'Projects retrieved successfully',
                type: 'array',
                items: ProjectSchemas.ProjectWithRelations,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
        },
    },

    ListOwnedProjects: {
        description: 'Get only projects owned by the authenticated user',
        tags: ['Projects'],
        summary: 'List Owned Projects',
        security: [{ bearerAuth: [] }],
        response: {
            200: {
                description: 'Owned projects retrieved successfully',
                type: 'array',
                items: ProjectSchemas.ProjectWithOwners,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
        },
    },

    CreateProject: {
        description: 'Create a new project',
        tags: ['Projects'],
        summary: 'Create Project',
        security: [{ bearerAuth: [] }],
        body: ProjectRequestSchemas.CreateProject,
        response: {
            201: {
                description: 'Project created successfully',
                ...ProjectSchemas.Project,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
        },
    },

    GetProject: {
        description: 'Get a specific project by ID',
        tags: ['Projects'],
        summary: 'Get Project',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
            id: Type.String({
                minLength: 1,
                description: 'Project ID'
            }),
        }),
        response: {
            200: {
                description: 'Project retrieved successfully',
                ...ProjectSchemas.ProjectWithUsers,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            403: {
                description: "Forbidden - user doesn't have access to this project",
                ...BaseSchemas.Error,
            },
            404: {
                description: 'Project not found',
                ...BaseSchemas.Error,
            },
        },
    },

    UpdateProject: {
        description: 'Update a project',
        tags: ['Projects'],
        summary: 'Update Project',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
            id: Type.String({
                minLength: 1,
                description: 'Project ID'
            }),
        }),
        body: ProjectRequestSchemas.UpdateProject,
        response: {
            200: {
                description: 'Project updated successfully',
                ...ProjectSchemas.Project,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            403: {
                description: 'Forbidden - user is not an owner of this project',
                ...BaseSchemas.Error,
            },
            404: {
                description: 'Project not found',
                ...BaseSchemas.Error,
            },
        },
    },

    DeleteProject: {
        description: 'Delete a project',
        tags: ['Projects'],
        summary: 'Delete Project',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
            id: Type.String({
                minLength: 1,
                description: 'Project ID'
            }),
        }),
        response: {
            204: {
                description: 'Project deleted successfully',
                type: 'null',
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            403: {
                description: 'Forbidden - user is not an owner of this project',
                ...BaseSchemas.Error,
            },
            404: {
                description: 'Project not found',
                ...BaseSchemas.Error,
            },
        },
    },

    AddProjectMember: {
        description: 'Add a member to a project',
        tags: ['Projects'],
        summary: 'Add Project Member',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
            id: Type.String({
                minLength: 1,
                description: 'Project ID'
            }),
        }),
        body: ProjectRequestSchemas.AddProjectMember,
        response: {
            200: {
                description: 'Member added successfully',
                ...ResponseSchemas.Success,
            },
            400: {
                description: 'Bad request - validation error',
                ...BaseSchemas.Error,
            },
            401: {
                description: 'Unauthorized - invalid or missing token',
                ...BaseSchemas.Error,
            },
            403: {
                description: 'Forbidden - user is not an owner of this project',
                ...BaseSchemas.Error,
            },
            404: {
                description: 'Project not found',
                ...BaseSchemas.Error,
            },
        },
    },
};

export type CreateProjectRequest = Static<typeof ProjectRequestSchemas.CreateProject>;
export type UpdateProjectRequest = Static<typeof ProjectRequestSchemas.UpdateProject>;
export type AddProjectMemberRequest = Static<typeof ProjectRequestSchemas.AddProjectMember>;

export type ProjectResponse = Static<typeof ProjectSchemas.Project>;
export type ProjectWithRelationsResponse = Static<typeof ProjectSchemas.ProjectWithRelations>;
export type ProjectWithOwnersResponse = Static<typeof ProjectSchemas.ProjectWithOwners>;
export type ProjectWithUsersResponse = Static<typeof ProjectSchemas.ProjectWithUsers>;
