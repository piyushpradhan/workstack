import { type PrismaClient } from "@prisma/client";
import { CacheService } from "../utils/cache.js";

class ProjectsService {
  constructor(private project: PrismaClient["project"], private cache: CacheService) { }

  getActiveProjectsCount = async ({ uid }: { uid: string }) => {
    try {
      return await this.cache.getOrSet(`projects:stats:${uid}`, async () => {
        const projects = await this.project.findMany({
          where: {
            OR: [
              {
                owners: {
                  some: {
                    userId: uid
                  }
                }
              },
              {
                members: {
                  some: {
                    userId: uid
                  }
                }
              }
            ],
            status: {
              in: ["ACTIVE", "ON_HOLD", "PLANNING"]
            }
          }
        });

        return {
          activeProjects: projects.length
        };
      }, { ttl: 3600, namespace: "projects" });
    } catch (error) {

    }
  }

  getAllUsersProjects = async ({ userId, limit, cursor, filters, sort }: { userId: string; limit: number; cursor?: string; filters?: Record<string, string | string[]>; sort?: Record<string, string>; }) => {
    try {
      const whereClause: any = {
        AND: [
          {
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
          }
        ]
      };

      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([filterName, filterValue]) => {
          if (filterName === 'search' && typeof filterValue === 'string') {
            whereClause.AND.push({
              OR: [
                {
                  name: {
                    contains: filterValue.trim(),
                    mode: "insensitive"
                  }
                },
                {
                  description: {
                    contains: filterValue.trim(),
                    mode: "insensitive"
                  }
                }
              ]
            });
          } else if (filterName === 'status') {
            const statuses = Array.isArray(filterValue) ? filterValue : [filterValue];
            if (statuses.length > 0) {
              whereClause.AND.push({
                status: {
                  in: statuses
                }
              });
            }
          }
        });
      }

      const orderByClause: any[] = [];
      if (sort && Object.keys(sort).length > 0) {
        Object.entries(sort).forEach(([sortName, sortValue]) => {
          orderByClause.push({
            [sortName]: sortValue
          });
        });
      }
      if (orderByClause.length === 0) {
        orderByClause.push({ id: 'desc' });
      }

      const projects = await this.project.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: whereClause,
        orderBy: orderByClause,
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

      // Check if there's a next page
      const hasNextPage = projects.length > limit;
      const projectsToReturn = hasNextPage ? projects.slice(0, limit) : projects;

      // Transform the data to flatten owners and members
      const transformedProjects = projectsToReturn.map(project => ({
        ...project,
        owners: project.owners.map(owner => owner.user),
        members: project.members.map(member => member.user)
      }));

      return {
        projects: transformedProjects,
        cursor: transformedProjects.length > 0 ? transformedProjects[transformedProjects.length - 1].id : undefined,
        hasNextPage
      }
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
        `projects:count:active:${ownerId}`,
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

  updateProject = async ({
    projectId,
    userId,
    updateData
  }: {
    projectId: string;
    userId: string;
    updateData: {
      name?: string;
      description?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      memberIds?: string[];
    };
  }) => {
    try {
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

      const { memberIds: updateMemberIds, ...projectUpdateData } = updateData;

      const updatePayload: any = { ...projectUpdateData };
      if (updatePayload.status) {
        updatePayload.status = updatePayload.status as any;
      }

      await this.project.update({
        where: {
          id: projectId
        },
        data: updatePayload
      });

      if (updateMemberIds !== undefined) {
        await this.project.update({
          where: { id: projectId },
          data: {
            members: {
              deleteMany: {},
              create: updateMemberIds.map((memberId) => ({
                userId: memberId
              }))
            }
          }
        });
      }

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

      const ownerUserIds = fullProject.owners.map(owner => owner.userId);
      const memberUserIds = fullProject.members.map(member => member.userId);
      const allUserIds = [...new Set([...ownerUserIds, ...memberUserIds])];

      const keysToInvalidate = [
        `project:${projectId}`
      ];

      // Invalidate caches for all owners and members
      allUserIds.forEach(userId => {
        keysToInvalidate.push(`projects:${userId}`, `projects:owned:${userId}`, `projects:count:active:${userId}`);
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
        keysToInvalidate.push(`projects:${userId}`, `projects:owned:${userId}`, `projects:count:active:${userId}`);
      });

      await this.cache.invalidateCache(keysToInvalidate, { namespace: 'projects' });

      return true;
    } catch (error) {
      throw error;
    }
  };
}

export default ProjectsService;
