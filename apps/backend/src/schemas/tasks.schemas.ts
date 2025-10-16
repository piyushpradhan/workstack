// OpenAPI/Swagger schemas for tasks endpoints

export const taskUserSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        email: { type: "string" },
        name: { type: "string", nullable: true }
    }
};

export const taskOwnerSchema = {
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

export const taskMemberSchema = {
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

export const projectReferenceSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        name: { type: "string" },
        description: { type: "string", nullable: true }
    }
};

export const taskSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string", nullable: true },
        status: {
            type: "string",
            enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
        },
        priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
        },
        dueDate: { type: "string", format: "date-time", nullable: true },
        completedAt: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
    }
};

export const taskWithRelationsSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string", nullable: true },
        status: {
            type: "string",
            enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
        },
        priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
        },
        dueDate: { type: "string", format: "date-time", nullable: true },
        completedAt: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        project: projectReferenceSchema,
        owners: {
            type: "array",
            items: taskOwnerSchema
        },
        members: {
            type: "array",
            items: taskMemberSchema
        }
    }
};

export const taskWithOwnersSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string", nullable: true },
        status: {
            type: "string",
            enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
        },
        priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
        },
        dueDate: { type: "string", format: "date-time", nullable: true },
        completedAt: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        project: projectReferenceSchema,
        owners: {
            type: "array",
            items: taskOwnerSchema
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
export const listTasksSchema = {
    description: "Get all tasks for the authenticated user",
    tags: ["Tasks"],
    summary: "List User Tasks",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Tasks retrieved successfully",
            type: "array",
            items: taskWithRelationsSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        }
    }
};

export const listOwnedTasksSchema = {
    description: "Get only tasks owned by the authenticated user",
    tags: ["Tasks"],
    summary: "List Owned Tasks",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Owned tasks retrieved successfully",
            type: "array",
            items: taskWithOwnersSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        }
    }
};

export const listTasksByProjectSchema = {
    description: "Get all tasks for a specific project",
    tags: ["Tasks"],
    summary: "List Project Tasks",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Project tasks retrieved successfully",
            type: "array",
            items: taskWithRelationsSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        404: {
            description: "Project not found or user doesn't have access",
            ...errorSchema
        }
    }
};

export const createTaskSchema = {
    description: "Create a new task",
    tags: ["Tasks"],
    summary: "Create Task",
    security: [{ bearerAuth: [] }],
    response: {
        201: {
            description: "Task created successfully",
            ...taskSchema
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

export const getTaskSchema = {
    description: "Get a specific task by ID",
    tags: ["Tasks"],
    summary: "Get Task",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Task retrieved successfully",
            ...taskWithRelationsSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        403: {
            description: "Forbidden - user doesn't have access to this task",
            ...errorSchema
        },
        404: {
            description: "Task not found",
            ...errorSchema
        }
    }
};

export const updateTaskSchema = {
    description: "Update a task",
    tags: ["Tasks"],
    summary: "Update Task",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Task updated successfully",
            ...taskSchema
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
            description: "Forbidden - user is not an owner of this task",
            ...errorSchema
        },
        404: {
            description: "Task not found",
            ...errorSchema
        }
    }
};

export const deleteTaskSchema = {
    description: "Delete a task",
    tags: ["Tasks"],
    summary: "Delete Task",
    security: [{ bearerAuth: [] }],
    response: {
        204: {
            description: "Task deleted successfully",
            type: "null"
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        403: {
            description: "Forbidden - user is not an owner of this task",
            ...errorSchema
        },
        404: {
            description: "Task not found",
            ...errorSchema
        }
    }
};
