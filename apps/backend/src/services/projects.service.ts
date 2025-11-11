import { type PrismaClient } from "@prisma/client";
import { CacheService } from "../utils/cache.js";

class ProjectsService {
  constructor(private project: PrismaClient["project"], private cache: CacheService) { }

  getAllUsersProjects = async ({ userId }: { userId: string }) => {
    try {
      return await this.cache.getOrSet(`projects:${userId}`, async () => {
        const projects = await this.project.findMany({
          where: {
            OR: [
              {
                owners: {
                  some: {
                    userId: userId
                  }
                }
              },
              {
                members: {
                  some: {
                    userId: userId
                  }
                }
              }
            ]
          },
          include: {
            owners: {
              include: {
                user: true
              }
            },
            members: {
              include: {
                user: true
              }
            }
          }
        });

        // Transform the data to flatten owners and members
        return projects.map(project => ({
          ...project,
          owners: project.owners.map(owner => owner.user),
          members: project.members.map(member => member.user)
        }));
      }, { ttl: 3600, namespace: "projects" });
    } catch (error) {
      throw error;
    }
  };

  getAllOwnedProjects = async ({ userId }: { userId: string }) => {
    try {
      return await this.cache.getOrSet(`projects:owned:${userId}`, async () => {
        const projects = await this.project.findMany({
          where: {
            owners: {
              some: {
                userId: userId
              }
            }
          },
          include: {
            owners: {
              include: {
                user: true
              }
            }
          }
        });

        // Transform the data to flatten owners
        return projects.map(project => ({
          ...project,
          owners: project.owners.map(owner => owner.user)
        }));
      }, { ttl: 3600, namespace: "projects" });
    } catch (error) {
      throw error;
    }
  };

  createProject = async ({ name, description, ownerId }: { name: string; description?: string; ownerId: string }) => {
    try {
      const createdProject = await this.project.create({
        data: {
          name,
          description,
          owners: {
            create: {
              userId: ownerId
            }
          }
        }
      });

      await this.cache.invalidateCache([
        `projects:${ownerId}`,
        `projects:owned:${ownerId}`,
      ], { namespace: 'projects' });

      return createdProject;
    } catch (error) {
      throw error;
    }
  };

  getProjectById = async ({ projectId, userId }: { projectId: string; userId: string }) => {
    try {
      return await this.cache.getOrSet(`project:${projectId}`, async () => {
        const project = await this.project.findFirst({
          where: {
            id: projectId,
            OR: [
              {
                owners: {
                  some: {
                    userId: userId
                  }
                }
              },
              {
                members: {
                  some: {
                    userId: userId
                  }
                }
              }
            ]
          },
          include: {
            owners: {
              include: {
                user: true
              }
            },
            members: {
              include: {
                user: true
              }
            }
          }
        });

        if (!project) {
          return null;
        }

        // Transform the data to flatten owners and members
        return {
          ...project,
          owners: project.owners.map(owner => owner.user),
          members: project.members.map(member => member.user)
        };
      }, { ttl: 3600, namespace: 'projects' });
    } catch (error) {
      throw error;
    }
  };

  updateProject = async ({ projectId, userId, updateData }: { projectId: string; userId: string; updateData: { name?: string; description?: string } }) => {
    try {
      // First check if user is an owner of the project
      const project = await this.project.findFirst({
        where: {
          id: projectId,
          owners: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          owners: true,
          members: true
        }
      });

      if (!project) {
        return null;
      }

      await this.project.update({
        where: {
          id: projectId
        },
        data: updateData
      });

      // Fetch full project data with relations for proper caching
      const fullProject = await this.project.findFirst({
        where: { id: projectId },
        include: {
          owners: {
            include: {
              user: true
            }
          },
          members: {
            include: {
              user: true
            }
          }
        }
      });

      if (!fullProject) {
        return null;
      }

      // Transform the data to flatten owners and members
      const transformedProject = {
        ...fullProject,
        owners: fullProject.owners.map(owner => owner.user),
        members: fullProject.members.map(member => member.user)
      };

      // Invalidate all the related cache keys
      const ownerIds = fullProject.owners.map(owner => owner.userId);
      const memberIds = fullProject.members.map(member => member.userId);
      const allUserIds = [...new Set([...ownerIds, ...memberIds])];

      const keysToInvalidate = [
        `project:${projectId}`
      ];

      // Invalidate caches for all owners and members
      allUserIds.forEach(userId => {
        keysToInvalidate.push(`projects:${userId}`, `projects:owned:${userId}`);
      });

      await this.cache.invalidateCache(keysToInvalidate, { namespace: 'projects' });

      // Cache the properly transformed project
      await this.cache.setCached(`project:${projectId}`, transformedProject, { ttl: 3600, namespace: 'projects' });

      return transformedProject;
    } catch (error) {
      throw error;
    }
  };

  deleteProject = async ({ projectId, userId }: { projectId: string; userId: string }) => {
    try {
      // Get project info before deletion for cache invalidation
      const project = await this.project.findFirst({
        where: {
          id: projectId,
          owners: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          owners: true,
          members: true
        }
      });

      if (!project) {
        return false;
      }

      await this.project.delete({
        where: {
          id: projectId
        }
      });

      // Invalidate all related caches
      const ownerIds = project.owners.map(owner => owner.userId);
      const memberIds = project.members.map(member => member.userId);
      const allUserIds = [...new Set([...ownerIds, ...memberIds])];

      const keysToInvalidate = [
        `project:${projectId}`
      ];

      // Invalidate caches for all owners and members
      allUserIds.forEach(userId => {
        keysToInvalidate.push(`projects:${userId}`, `projects:owned:${userId}`);
      });

      await this.cache.invalidateCache(keysToInvalidate, { namespace: 'projects' });

      return true;
    } catch (error) {
      throw error;
    }
  };
}

export default ProjectsService;
