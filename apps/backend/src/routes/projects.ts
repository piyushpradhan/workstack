import { type FastifyPluginAsync } from "fastify";
import * as projectSchemas from "../schemas/projects.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
  const { projects } = fastify.controllers;

  fastify.route({
    method: "GET",
    url: "/",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.listProjectsSchema,
    handler: projects.list
  });
  
  fastify.route({
    method: "GET",
    url: "/owned",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.listOwnedProjectsSchema,
    handler: projects.listOwned
  });

  fastify.route({
    method: "POST",
    url: "/",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.createProjectSchema,
    handler: projects.create
  });

  fastify.route({
    method: "GET",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.getProjectSchema,
    handler: projects.get
  });

  fastify.route({
    method: "PUT",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.updateProjectSchema,
    handler: projects.update
  });

  fastify.route({
    method: "DELETE",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.deleteProjectSchema,
    handler: projects.delete
  });
};

export default routes;
