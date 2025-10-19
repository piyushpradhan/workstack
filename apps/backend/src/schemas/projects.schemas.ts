export const projectUserSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        email: { type: "string" },
        name: { type: "string", nullable: true }
    }
};

export const projectOwnerSchema = {
    type: "object",
    properties: {
        user: {
            type: "object",
            properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" }
            }
        }
    }
};

export const projectMemberSchema = {
    type: "object",
    properties: {
        user: {
            type: "object",
            properties: {
                id: { type: "string" },
                email: { type: "string" },
                name: { type: "string" }
            }
        }
    }
};

export const projectSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
    }
};

export const projectWithRelationsSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        owners: {
            type: "array",
            items: projectOwnerSchema
        },
        members: {
            type: "array",
            items: projectMemberSchema
        }
    }
};

export const projectWithOwnersSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        owners: {
            type: "array",
            items: projectOwnerSchema
        }
    }
};

export const projectWithUsersSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        owners: {
            type: "array",
            items: projectUserSchema
        },
        members: {
            type: "array",
            items: projectUserSchema
        }
    }
};

export const errorSchema = {
    type: "object",
    properties: {
        error: { type: "string" }
    }
};

// Route schemas
export const listProjectsSchema = {
    description: "Get all projects for the authenticated user",
    tags: ["Projects"],
    summary: "List User Projects",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Projects retrieved successfully",
            type: "array",
            items: projectWithRelationsSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        }
    }
};

export const listOwnedProjectsSchema = {
    description: "Get only projects owned by the authenticated user",
    tags: ["Projects"],
    summary: "List Owned Projects",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Owned projects retrieved successfully",
            type: "array",
            items: projectWithOwnersSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        }
    }
};

export const createProjectSchema = {
    description: "Create a new project",
    tags: ["Projects"],
    summary: "Create Project",
    security: [{ bearerAuth: [] }],
    response: {
        201: {
            description: "Project created successfully",
            ...projectSchema
        },
        400: {
            description: "Bad request - validation error",
            ...errorSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        }
    }
};

export const getProjectSchema = {
    description: "Get a specific project by ID",
    tags: ["Projects"],
    summary: "Get Project",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Project retrieved successfully",
            ...projectWithUsersSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        403: {
            description: "Forbidden - user doesn't have access to this project",
            ...errorSchema
        },
        404: {
            description: "Project not found",
            ...errorSchema
        }
    }
};

export const updateProjectSchema = {
    description: "Update a project",
    tags: ["Projects"],
    summary: "Update Project",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Project updated successfully",
            ...projectSchema
        },
        400: {
            description: "Bad request - validation error",
            ...errorSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        403: {
            description: "Forbidden - user is not an owner of this project",
            ...errorSchema
        },
        404: {
            description: "Project not found",
            ...errorSchema
        }
    }
};

export const deleteProjectSchema = {
    description: "Delete a project",
    tags: ["Projects"],
    summary: "Delete Project",
    security: [{ bearerAuth: [] }],
    response: {
        204: {
            description: "Project deleted successfully",
            type: "null"
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        403: {
            description: "Forbidden - user is not an owner of this project",
            ...errorSchema
        },
        404: {
            description: "Project not found",
            ...errorSchema
        }
    }
};
