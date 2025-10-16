import z from "zod";

// Task status enum
const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']);

// Task priority enum
const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

// Base task schema
const taskBaseSchema = z.object({
    title: z.string().min(1, "Task title is required").max(200, "Task title must be less than 200 characters"),
    description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: z.string().datetime("Invalid date format").optional()
});

// Create task schema
export const createTask = {
    body: taskBaseSchema.extend({
        projectId: z.string().cuid("Invalid project ID format")
    }),
    description: "Create a new task",
    summary: "Create Task"
};

// Update task schema
export const updateTask = {
    params: z.object({
        id: z.string().cuid("Invalid task ID format")
    }),
    body: taskBaseSchema.extend({
        status: taskStatusEnum.optional()
    }).partial(),
    description: "Update an existing task",
    summary: "Update Task"
};

// Get task schema
export const getTask = {
    params: z.object({
        id: z.string().cuid("Invalid task ID format")
    }),
    description: "Get a specific task by ID",
    summary: "Get Task"
};

// Delete task schema
export const deleteTask = {
    params: z.object({
        id: z.string().cuid("Invalid task ID format")
    }),
    description: "Delete a task",
    summary: "Delete Task"
};

// List tasks schema
export const listTasks = {
    description: "Get all tasks for the authenticated user",
    summary: "List User Tasks"
};

// List owned tasks schema
export const listOwnedTasks = {
    description: "Get only tasks owned by the authenticated user",
    summary: "List Owned Tasks"
};

// List tasks by project schema
export const listTasksByProject = {
    params: z.object({
        projectId: z.string().cuid("Invalid project ID format")
    }),
    description: "Get all tasks for a specific project",
    summary: "List Project Tasks"
};
