import { type FastifyPluginAsync } from "fastify";
import * as userSchemas from "../schemas/users.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
    const { users } = fastify.controllers;

    fastify.route({
        method: "GET",
        url: "/",
        preHandler: [fastify.authenticate],
        schema: userSchemas.getUserSchema,
        handler: users.get
    });

    fastify.route({
        method: "GET",
        url: "/current",
        preHandler: [fastify.authenticate],
        schema: userSchemas.getCurrentUserSchema,
        handler: users.getCurrentUser
    });
};

export default routes;