import type { FastifyPluginAsync } from "fastify";
import { AuthRouteSchemas } from "../schemas/auth.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
  const { auth } = fastify.controllers;

  fastify.route({
    method: "POST",
    url: "/register",
    schema: AuthRouteSchemas.Register,
    handler: auth.register,
  });

  fastify.route({
    method: "POST",
    url: "/login",
    schema: AuthRouteSchemas.Login,
    handler: auth.login,
  });
};

export default routes;
