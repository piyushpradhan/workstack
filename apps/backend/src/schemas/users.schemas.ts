import { errorSchema } from "./projects.schemas.js";

const userSchema = {
    type: "object",
    properties: {
        id: { type: "string" },
        email: { type: "string" },
        name: { type: "string" },
        avatar: { type: "string", nullable: true },
        role: { type: "string" },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
    },
    required: ["id", "email", "name", "role", "isActive", "createdAt", "updatedAt"]
}

export const getUserSchema = {
    description: "Get user details",
    tags: ["Users"],
    summary: "Get single user details using either UID or email",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "User details retrieved successfully",
            ...userSchema
        },
        400: {
            description: "Bad request",
            ...errorSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        },
        500: {
            description: "Internal server error",
            ...errorSchema
        },
    }
}

export const getCurrentUserSchema = {
    description: "Get current user details",
    tags: ["Users"],
    summary: "Get current user details",
    security: [{ bearerAuth: [] }],
    response: {
        200: {
            description: "Current user details retrieved successfully",
            ...userSchema
        },
        500: {
            description: "Internal server error",
            ...errorSchema
        },
        401: {
            description: "Unauthorized - invalid or missing token",
            ...errorSchema
        }
    }
}