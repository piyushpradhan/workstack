import { type RouteHandler } from "fastify";
import type ProjectsService from "../services/projects.service.js";


class ProjectsController {
  constructor(
    private projectsService: ProjectsService
  ) { }

  list: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const projects = await this.projectsService.getAllUsersProjects({ userId });

      return reply.code(200).send(projects);
    } catch (error) {
      request.log.error(error, "Error fetching user projects");
      return reply.code(500).send({ error: "Internal server error" });
    }
  };

  listOwned: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const projects = await this.projectsService.getAllOwnedProjects({ userId });

      return reply.code(200).send(projects);
    } catch (error) {
      request.log.error(error, "Error fetching owned projects");
      return reply.code(500).send({ error: "Internal server error" });
    }
  };

  create: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const { name, description } = request.body as { name: string; description?: string };

      const project = await this.projectsService.createProject({
        name,
        description,
        ownerId: userId
      });

      return reply.code(201).send(project);
    } catch (error) {
      request.log.error(error, "Error creating project");
      return reply.code(500).send({ error: "Internal server error" });
    }
  };

  get: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };

      const project = await this.projectsService.getProjectById({ projectId: id, userId });

      if (!project) {
        return reply.code(404).send({ error: "Project not found" });
      }

      return reply.code(200).send(project);
    } catch (error) {
      request.log.error(error, "Error fetching project");
      return reply.code(500).send({ error: "Internal server error" });
    }
  };

  update: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };
      const updateData = request.body as { name?: string; description?: string };

      const project = await this.projectsService.updateProject({
        projectId: id,
        userId,
        updateData
      });

      if (!project) {
        return reply.code(404).send({ error: "Project not found" });
      }

      return reply.code(200).send(project);
    } catch (error) {
      request.log.error(error, "Error updating project");
      return reply.code(500).send({ error: "Internal server error" });
    }
  };

  delete: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };

      const deleted = await this.projectsService.deleteProject({
        projectId: id,
        userId
      });

      if (!deleted) {
        return reply.code(404).send({ error: "Project not found" });
      }

      return reply.code(204).send();
    } catch (error) {
      request.log.error(error, "Error deleting project");
      return reply.code(500).send({ error: "Internal server error" });
    }
  };
}

export default ProjectsController;
