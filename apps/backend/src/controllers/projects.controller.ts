import { type RouteHandler } from "fastify";
import type ProjectsService from "../services/projects.service.js";
import { ResponseHelper } from "../utils/response.js";


class ProjectsController {
  constructor(
    private projectsService: ProjectsService
  ) { }

  list: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const projects = await this.projectsService.getAllUsersProjects({ userId });

      return ResponseHelper.success(reply, projects, "Projects retrieved successfully");
    } catch (error) {
      request.log.error(error, "Error fetching user projects");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch projects");
    }
  };

  listOwned: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const projects = await this.projectsService.getAllOwnedProjects({ userId });

      return ResponseHelper.success(reply, projects, "Owned projects retrieved successfully");
    } catch (error) {
      request.log.error(error, "Error fetching owned projects");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch owned projects");
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

      return ResponseHelper.success(reply, project, "Project created successfully", 201);
    } catch (error) {
      request.log.error(error, "Error creating project");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to create project");
    }
  };

  get: RouteHandler = async (request, reply) => {
    try {
      const userId = request.user.sub;
      const { id } = request.params as { id: string };

      const project = await this.projectsService.getProjectById({ projectId: id, userId });

      if (!project) {
        return ResponseHelper.error(reply, "Project not found", 404, "ProjectNotFound");
      }

      return ResponseHelper.success(reply, project, "Project retrieved successfully");
    } catch (error) {
      request.log.error(error, "Error fetching project");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to fetch project");
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
        return ResponseHelper.error(reply, "Project not found", 404, "ProjectNotFound");
      }

      return ResponseHelper.success(reply, project, "Project updated successfully");
    } catch (error) {
      request.log.error(error, "Error updating project");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to update project");
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
        return ResponseHelper.error(reply, "Project not found", 404, "ProjectNotFound");
      }

      return ResponseHelper.noContent(reply);
    } catch (error) {
      request.log.error(error, "Error deleting project");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to delete project");
    }
  };
}

export default ProjectsController;
