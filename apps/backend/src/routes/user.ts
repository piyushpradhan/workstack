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
};

export default routes;