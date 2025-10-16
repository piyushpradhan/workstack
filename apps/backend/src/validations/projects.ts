import z from "zod";

// Base project schema
const projectBaseSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
    description: z.string().max(500, "Description must be less than 500 characters").optional()
});

// Create project schema
export const createProject = {
    body: projectBaseSchema,
    description: "Create a new project",
    summary: "Create Project"
};

// Update project schema
export const updateProject = {
    params: z.object({
        id: z.string().uuid("Invalid project ID format")
    }),
    body: projectBaseSchema.partial(),
    description: "Update an existing project",
    summary: "Update Project"
};

// Get project schema
export const getProject = {
    params: z.object({
        id: z.string().uuid("Invalid project ID format")
    }),
    description: "Get a specific project by ID",
    summary: "Get Project"
};

// Delete project schema
export const deleteProject = {
    params: z.object({
        id: z.string().uuid("Invalid project ID format")
    }),
    description: "Delete a project",
    summary: "Delete Project"
};

// List projects schema
export const listProjects = {
    description: "Get all projects for the authenticated user",
    summary: "List User Projects"
};

// List owned projects schema
export const listOwnedProjects = {
    description: "Get only projects owned by the authenticated user",
    summary: "List Owned Projects"
};
