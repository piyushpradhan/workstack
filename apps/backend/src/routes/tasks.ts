import { type FastifyPluginAsync } from "fastify";
import * as taskSchemas from "../schemas/tasks.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
    const { tasks } = fastify.controllers;

    // Get all tasks for the authenticated user (owned + member)
    fastify.route({
        method: "GET",
        url: "/",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.listTasksSchema,
        handler: tasks.list
    });

    // Get only owned tasks for the authenticated user
    fastify.route({
        method: "GET",
        url: "/owned",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.listOwnedTasksSchema,
        handler: tasks.listOwned
    });

    // Get tasks by project
    fastify.route({
        method: "GET",
        url: "/project/:projectId",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.listTasksByProjectSchema,
        handler: tasks.listByProject
    });

    // Create a new task
    fastify.route({
        method: "POST",
        url: "/",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.createTaskSchema,
        handler: tasks.create
    });

    // Get a specific task by ID
    fastify.route({
        method: "GET",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.getTaskSchema,
        handler: tasks.get
    });

    // Update a task
    fastify.route({
        method: "PUT",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.updateTaskSchema,
        handler: tasks.update
    });

    // Delete a task
    fastify.route({
        method: "DELETE",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.deleteTaskSchema,
        handler: tasks.delete
    });
};

export default routes;
