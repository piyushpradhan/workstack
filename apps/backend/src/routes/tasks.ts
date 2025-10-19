import { type FastifyPluginAsync } from "fastify";
import * as taskSchemas from "../schemas/tasks.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
    const { tasks } = fastify.controllers;

    fastify.route({
        method: "GET",
        url: "/",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.listTasksSchema,
        handler: tasks.list
    });

    fastify.route({
        method: "GET",
        url: "/owned",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.listOwnedTasksSchema,
        handler: tasks.listOwned
    });

    fastify.route({
        method: "GET",
        url: "/project/:projectId",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.listTasksByProjectSchema,
        handler: tasks.listByProject
    });

    fastify.route({
        method: "POST",
        url: "/",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.createTaskSchema,
        handler: tasks.create
    });

    fastify.route({
        method: "GET",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.getTaskSchema,
        handler: tasks.get
    });

    fastify.route({
        method: "PUT",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.updateTaskSchema,
        handler: tasks.update
    });

    fastify.route({
        method: "DELETE",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: taskSchemas.deleteTaskSchema,
        handler: tasks.delete
    });
};

export default routes;
