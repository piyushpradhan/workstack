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
        success: { type: "boolean", const: false },
        message: { type: "string" },
        error: { type: "string" }
    },
    required: ["success", "message", "error"]
};

const createSuccessResponseSchema = (dataSchema: any, description?: string) => ({
    type: "object",
    properties: {
        success: { type: "boolean", const: true },
        data: dataSchema,
        message: { type: "string" }
    },
    required: ["success", "data"],
    description: description
});

const createCursorPaginatedResponseSchema = (itemSchema: any, description?: string) => ({
    type: "object",
    properties: {
        success: { type: "boolean", const: true },
        data: {
            type: "array",
            items: itemSchema
        },
        message: { type: "string" },
        cursor: { type: "string", nullable: true, description: "Cursor for next page" },
        meta: {
            type: "object",
            properties: {
                hasNextPage: { type: "boolean" },
                hasPreviousPage: { type: "boolean" }
            },
            required: ["hasNextPage", "hasPreviousPage"]
        }
    },
    required: ["success", "data", "meta"],
    description: description
});

// Route schemas
export const listTasksSchema = {
    description: "Get all tasks for the authenticated user",
    tags: ["Tasks"],
    summary: "List User Tasks",
    security: [{ bearerAuth: [] }],
    querystring: {
        type: "object",
        properties: {
            limit: { type: "number", minimum: 1, maximum: 100, default: 10, description: "Number of items per page" },
            cursor: { type: "string", description: "Cursor for pagination" },
            search: { type: "string", description: "Search query for title and description" },
            projectIds: {
                type: "array",
                items: { type: "string" },
                description: "Filter by project IDs"
            },
            statuses: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
                },
                description: "Filter by task statuses"
            },
            priorities: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
                },
                description: "Filter by task priorities"
            },
            assigneeIds: {
                type: "array",
                items: { type: "string" },
                description: "Filter by assignee (owner) user IDs"
            },
            sort: {
                type: "string",
                description: "Sort parameters in format: field:order,field2:order2 (e.g., createdAt:desc,title:asc)"
            }
        }
    },
    response: {
        200: createCursorPaginatedResponseSchema(taskWithRelationsSchema, "Tasks retrieved successfully"),
        401: errorSchema
    }
};

export const listOwnedTasksSchema = {
    description: "Get only tasks owned by the authenticated user",
    tags: ["Tasks"],
    summary: "List Owned Tasks",
    security: [{ bearerAuth: [] }],
    querystring: {
        type: "object",
        properties: {
            limit: { type: "number", minimum: 1, maximum: 100, default: 10, description: "Number of items per page" },
            cursor: { type: "string", description: "Cursor for pagination" },
            search: { type: "string", description: "Search query for title and description" },
            projectIds: {
                type: "array",
                items: { type: "string" },
                description: "Filter by project IDs"
            },
            statuses: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
                },
                description: "Filter by task statuses"
            },
            priorities: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
                },
                description: "Filter by task priorities"
            },
            sort: {
                type: "string",
                description: "Sort parameters in format: field:order,field2:order2 (e.g., createdAt:desc,title:asc)"
            }
        }
    },
    response: {
        200: createCursorPaginatedResponseSchema(taskWithOwnersSchema, "Owned tasks retrieved successfully"),
        401: errorSchema
    }
};

export const listTasksByProjectSchema = {
    description: "Get all tasks for a specific project",
    tags: ["Tasks"],
    summary: "List Project Tasks",
    security: [{ bearerAuth: [] }],
    querystring: {
        type: "object",
        properties: {
            limit: { type: "number", minimum: 1, maximum: 100, default: 10, description: "Number of items per page" },
            cursor: { type: "string", description: "Cursor for pagination" },
            search: { type: "string", description: "Search query for title and description" },
            statuses: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
                },
                description: "Filter by task statuses"
            },
            priorities: {
                type: "array",
                items: {
                    type: "string",
                    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
                },
                description: "Filter by task priorities"
            },
            assigneeIds: {
                type: "array",
                items: { type: "string" },
                description: "Filter by assignee (owner) user IDs"
            },
            sort: {
                type: "string",
                description: "Sort parameters in format: field:order,field2:order2 (e.g., createdAt:desc,title:asc)"
            }
        }
    },
    response: {
        200: createCursorPaginatedResponseSchema(taskWithRelationsSchema, "Project tasks retrieved successfully"),
        401: errorSchema,
        404: errorSchema
    }
};

export const createTaskSchema = {
    description: "Create a new task",
    tags: ["Tasks"],
    summary: "Create Task",
    security: [{ bearerAuth: [] }],
    response: {
        201: createSuccessResponseSchema(taskSchema, "Task created successfully"),
        400: errorSchema,
        401: errorSchema
    }
};

export const getTaskSchema = {
    description: "Get a specific task by ID",
    tags: ["Tasks"],
    summary: "Get Task",
    security: [{ bearerAuth: [] }],
    response: {
        200: createSuccessResponseSchema(taskWithRelationsSchema, "Task retrieved successfully"),
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
    }
};

export const updateTaskSchema = {
    description: "Update a task",
    tags: ["Tasks"],
    summary: "Update Task",
    security: [{ bearerAuth: [] }],
    body: {
        type: "object",
        properties: {
            title: { type: "string" },
            description: { type: "string" },
            status: {
                type: "string",
                enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]
            },
            priority: {
                type: "string",
                enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
            },
            dueDate: { type: "string", format: "date-time" },
            ownerIds: {
                type: "array",
                items: { type: "string" }
            },
            memberIds: {
                type: "array",
                items: { type: "string" }
            }
        }
    },
    response: {
        200: createSuccessResponseSchema({
            ...taskSchema,
            properties: {
                ...taskSchema.properties,
                projectId: { type: "string" }
            }
        }, "Task updated successfully"),
        400: errorSchema,
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
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
        401: errorSchema,
        403: errorSchema,
        404: errorSchema
    }
};
