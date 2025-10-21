import { type FastifyPluginAsync } from "fastify";
import { ProjectRouteSchemas } from "../schemas/projects.schemas.js";

const routes: FastifyPluginAsync = async (fastify) => {
  const { projects } = fastify.controllers;

  fastify.route({
    method: "GET",
    url: "/",
    preHandler: [fastify.authenticate],
    schema: ProjectRouteSchemas.ListProjects,
    handler: projects.list
  });

  fastify.route({
    method: "GET",
    url: "/owned",
    preHandler: [fastify.authenticate],
    schema: ProjectRouteSchemas.ListOwnedProjects,
    handler: projects.listOwned
  });

  fastify.route({
    method: "POST",
    url: "/",
    preHandler: [fastify.authenticate],
    schema: ProjectRouteSchemas.CreateProject,
    handler: projects.create
  });

  fastify.route({
    method: "GET",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: ProjectRouteSchemas.GetProject,
    handler: projects.get
  });

  fastify.route({
    method: "PUT",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: ProjectRouteSchemas.UpdateProject,
    handler: projects.update
  });

  fastify.route({
    method: "DELETE",
    url: "/:id",
    preHandler: [fastify.authenticate],
    schema: ProjectRouteSchemas.DeleteProject,
    handler: projects.delete
  });
};

export default routes;
