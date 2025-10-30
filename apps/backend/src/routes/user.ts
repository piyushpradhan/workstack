import { type FastifyPluginAsync } from "fastify";
import { UserRouteSchemas } from "../schemas/users.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
    const { users } = fastify.controllers;

    fastify.route({
        method: "GET",
        url: "/current",
        preHandler: [fastify.authenticate],
        schema: UserRouteSchemas.GetCurrentUser,
        handler: users.getCurrentUser
    });

    fastify.route({
        method: "PATCH",
        url: "/current",
        preHandler: [fastify.authenticate],
        schema: UserRouteSchemas.UpdateProfile,
        handler: users.updateCurrentUser
    });

    fastify.route({
        method: "GET",
        url: "/:id",
        preHandler: [fastify.authenticate],
        schema: UserRouteSchemas.GetUserById,
        handler: users.getUserById
    })

    fastify.route({
        method: "GET",
        url: "/projects/:projectIds",
        preHandler: [fastify.authenticate],
        schema: UserRouteSchemas.GetUsersByProjects,
        handler: users.getUsersByProjects
    })
};

export default routes;