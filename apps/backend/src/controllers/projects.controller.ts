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
      const query = request.query as {
        limit?: number;
        cursor?: string;
        filters?: string | string[];
        sort?: string;
      };
      const defaultLimit = 10;
      const actualLimit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : defaultLimit;

      const appliedFilters: Record<string, string | string[]> = {};
      if (query.filters) {
        const filtersArray = Array.isArray(query.filters) ? query.filters : [query.filters];
        filtersArray.forEach((filter: string) => {
          if (filter && filter.includes(':')) {
            const [filterName, filterValue] = filter.split(':');
            if (filterName && filterValue) {
              if (appliedFilters[filterName]) {
                const existing = appliedFilters[filterName];
                if (Array.isArray(existing)) {
                  existing.push(filterValue);
                } else {
                  appliedFilters[filterName] = [existing, filterValue];
                }
              } else {
                appliedFilters[filterName] = filterValue;
              }
            }
          }
        });
      }

      const appliedSort: Record<string, string> = {};
      if (query.sort) {
        query.sort.split(',').forEach((sort: string) => {
          const [sortName, sortValue] = sort.split(':');
          if (sortName && sortValue) {
            appliedSort[sortName] = sortValue;
          }
        });
      }

      const { projects, cursor: nextCursor, hasNextPage } = await this.projectsService.getAllUsersProjects({
        userId,
        limit: actualLimit,
        cursor: query.cursor,
        filters: appliedFilters,
        sort: appliedSort,
      });

      return ResponseHelper.cursorPaginated(reply, projects, nextCursor, hasNextPage, "Projects retrieved successfully");
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
      const bodyData = request.body as {
        name?: string;
        description?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        memberIds?: string[];
      };

      const updateData: {
        name?: string;
        description?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        memberIds?: string[];
      } = {
        name: bodyData.name,
        description: bodyData.description,
        status: bodyData.status,
        startDate: bodyData.startDate ? new Date(bodyData.startDate) : undefined,
        endDate: bodyData.endDate ? new Date(bodyData.endDate) : undefined,
        memberIds: bodyData.memberIds,
      };

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
