import { type FastifyPluginAsync } from "fastify";
import * as projectSchemas from "../schemas/projects.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
  const { projects } = fastify.controllers;

  // Get all projects for the authenticated user (owned + member)
  fastify.route({
    method: "GET",
    url: "/",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.listProjectsSchema,
    handler: projects.list
  });

  // Get only owned projects for the authenticated user
  fastify.route({
    method: "GET",
    url: "/owned",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.listOwnedProjectsSchema,
    handler: projects.listOwned
  });

  // Create a new project
  fastify.route({
    method: "POST",
    url: "/",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.createProjectSchema,
    handler: projects.create
  });

  // Get a specific project by ID
  fastify.route({
    method: "GET",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.getProjectSchema,
    handler: projects.get
  });

  // Update a project
  fastify.route({
    method: "PUT",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.updateProjectSchema,
    handler: projects.update
  });

  // Delete a project
  fastify.route({
    method: "DELETE",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: projectSchemas.deleteProjectSchema,
    handler: projects.delete
  });
};

export default routes;
