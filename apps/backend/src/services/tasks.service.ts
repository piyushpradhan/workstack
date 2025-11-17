import { TaskStatus, type PrismaClient } from "@prisma/client";
import { CacheService } from "../utils/cache.js";

class TasksService {
  constructor(private task: PrismaClient["task"], private cache: CacheService) { }

  getUserTaskStats = async ({ uid }: { uid: string }) => {
    try {
      return await this.cache.getOrSet(`tasks:stats:${uid}`, async () => {
        const myTaskCount = await this.task.count({
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
            ]
          }
        });

        const overdueTaskCount = await this.task.count({
          where: {
            status: {
              in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW]
            },
            dueDate: {
              lt: new Date()
            },
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
            ]
          },
        });

        const completedTaskCount = await this.task.count({
          where: {
            status: {
              in: ["DONE", "CANCELLED"]
            },
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
            ]
          }
        });

        return {
          myTasks: myTaskCount,
          overdueTasks: overdueTaskCount,
          completedTasks: completedTaskCount
        };
      })
    } catch (error) {
      throw error;
    }
  }

  getAllUsersTasks = async ({ userId, limit, cursor }: { userId: string; limit: number; cursor?: string }) => {
    try {
      // Don't cache paginated results
      const tasks = await this.task.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
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
        orderBy: {
          id: 'desc'
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
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
      const hasNextPage = tasks.length > limit;
      const tasksToReturn = hasNextPage ? tasks.slice(0, limit) : tasks;

      const transformedTasks = tasksToReturn.map(task => ({
        ...task,
        owners: task.owners.map(owner => owner.user),
        members: task.members.map(member => member.user)
      }));

      return {
        tasks: transformedTasks,
        cursor: transformedTasks.length > 0 ? transformedTasks[transformedTasks.length - 1].id : undefined,
        hasNextPage
      };
    } catch (error) {
      throw error;
    }
  };

  getAllOwnedTasks = async ({ userId, limit, cursor }: { userId: string; limit: number; cursor?: string }) => {
    try {
      const tasks = await this.task.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          owners: {
            some: {
              userId: userId
            }
          }
        },
        orderBy: {
          id: 'desc'
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          owners: {
            include: {
              user: true
            }
          }
        }
      });

      // Check if there's a next page
      const hasNextPage = tasks.length > limit;
      const tasksToReturn = hasNextPage ? tasks.slice(0, limit) : tasks;

      const transformedTasks = tasksToReturn.map(task => ({
        ...task,
        owners: task.owners.map(owner => owner.user)
      }));

      return {
        tasks: transformedTasks,
        cursor: transformedTasks.length > 0 ? transformedTasks[transformedTasks.length - 1].id : undefined,
        hasNextPage
      };
    } catch (error) {
      throw error;
    }
  };

  getTasksByProject = async ({ projectId, userId, limit, cursor }: { projectId: string; userId: string; limit: number; cursor?: string }) => {
    try {
      const tasks = await this.task.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          projectId,
        },
        orderBy: {
          id: 'desc'
        },
        include: {
          project: true,
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
      const hasNextPage = tasks.length > limit;
      const tasksToReturn = hasNextPage ? tasks.slice(0, limit) : tasks;

      const transformedTasks = tasksToReturn.map(task => ({
        ...task,
        owners: task.owners.map(owner => owner.user),
        members: task.members.map(member => member.user)
      }));

      return {
        tasks: transformedTasks,
        cursor: transformedTasks.length > 0 ? transformedTasks[transformedTasks.length - 1].id : undefined,
        hasNextPage
      };
    } catch (error) {
      throw error;
    }
  };

  createTask = async ({
    title,
    description,
    priority,
    dueDate,
    projectId,
    ownerId
  }: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
    projectId: string;
    ownerId: string;
  }) => {
    try {
      const createdTask = await this.task.create({
        data: {
          title,
          description,
          priority: priority as any,
          dueDate,
          projectId,
          owners: {
            create: {
              userId: ownerId
            }
          }
        }
      });

      await this.cache.invalidateCache([
        `tasks:${ownerId}`,
        `tasks:owned:${ownerId}`,
        `tasks:project:${projectId}`,
      ], { namespace: 'tasks' });

      const newTask = await this.task.findFirst({
        where: {
          id: createdTask.id
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
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

      return newTask;
    } catch (error) {
      throw error;
    }
  };

  getTaskById = async ({ taskId, userId }: { taskId: string; userId: string }) => {
    try {
      return await this.cache.getOrSet(`task:${taskId}`, async () => {
        const task = await this.task.findFirst({
          where: {
            id: taskId,
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
            project: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
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

        if (!task) {
          return null;
        }

        // Transform the data to flatten owners and members
        const transformedTask = {
          ...task,
          owners: task.owners.map(owner => owner.user),
          members: task.members.map(member => member.user)
        };

        return transformedTask;

      }, { ttl: 3600, namespace: 'tasks' })
    } catch (error) {
      throw error;
    }
  };

  updateTask = async ({
    taskId,
    updateData
  }: {
    taskId: string;
    userId: string;
    updateData: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: Date;
    }
  }) => {
    try {
      const task = await this.task.findFirst({
        where: {
          id: taskId
        }
      });

      if (!task) {
        return null;
      }

      const updatePayload: any = { ...updateData };

      // If status is being updated to DONE, set completedAt
      if (updateData.status === "DONE" && task.status !== "DONE") {
        updatePayload.completedAt = new Date();
      }

      // If status is being updated from DONE to something else, clear completedAt
      if (updateData.status && updateData.status !== "DONE" && task.status === "DONE") {
        updatePayload.completedAt = null;
      }

      await this.task.update({
        where: {
          id: taskId
        },
        data: updatePayload
      });

      // Fetch full task data with relations for proper caching
      const fullTask = await this.task.findFirst({
        where: { id: taskId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
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

      if (!fullTask) {
        return null;
      }

      // Transform the data to flatten owners and members
      const transformedTask = {
        ...fullTask,
        owners: fullTask.owners.map(owner => owner.user),
        members: fullTask.members.map(member => member.user)
      };

      // Invalidate all the related cache keys
      const ownerIds = fullTask.owners.map(owner => owner.userId);
      const memberIds = fullTask.members.map(member => member.userId);
      const allUserIds = [...new Set([...ownerIds, ...memberIds])];

      const keysToInvalidate = [
        `task:${taskId}`,
        `tasks:project:${fullTask.projectId}`
      ];

      // Invalidate caches for all owners and members
      allUserIds.forEach(userId => {
        keysToInvalidate.push(`tasks:${userId}`, `tasks:owned:${userId}`);
      });

      await this.cache.invalidateCache(keysToInvalidate, { namespace: 'tasks' });

      // Cache the properly transformed task
      await this.cache.setCached(`task:${taskId}`, transformedTask, { ttl: 3600, namespace: 'tasks' });

      return transformedTask;
    } catch (error) {
      throw error;
    }
  };

  deleteTask = async ({ taskId, userId }: { taskId: string; userId: string }) => {
    try {
      // Get task info before deletion for cache invalidation
      const task = await this.task.findFirst({
        where: {
          id: taskId,
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

      if (!task) {
        return false;
      }

      await this.task.delete({
        where: {
          id: taskId
        }
      });

      // Invalidate all related caches
      const ownerIds = task.owners.map(owner => owner.userId);
      const memberIds = task.members.map(member => member.userId);
      const allUserIds = [...new Set([...ownerIds, ...memberIds])];

      const keysToInvalidate = [
        `task:${taskId}`,
        `tasks:project:${task.projectId}`
      ];

      // Invalidate caches for all owners and members
      allUserIds.forEach(userId => {
        keysToInvalidate.push(`tasks:${userId}`, `tasks:owned:${userId}`);
      });

      await this.cache.invalidateCache(keysToInvalidate, { namespace: 'tasks' });

      return true;
    } catch (error) {
      throw error;
    }
  };
}

export default TasksService;
