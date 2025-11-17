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

  getAllUsersTasks = async ({
    userId,
    limit,
    cursor,
    search,
    projectIds,
    statuses,
    priorities,
    assigneeIds,
    sort
  }: {
    userId: string;
    limit: number;
    cursor?: string;
    search?: string;
    projectIds?: string[];
    statuses?: string[];
    priorities?: string[];
    assigneeIds?: string[];
    sort?: Record<string, string>;
  }) => {
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

      if (search && search.trim()) {
        whereClause.AND.push({
          OR: [
            {
              title: {
                contains: search.trim(),
                mode: "insensitive"
              }
            },
            {
              description: {
                contains: search.trim(),
                mode: "insensitive"
              }
            }
          ]
        });
      }

      if (projectIds && projectIds.length > 0) {
        whereClause.AND.push({
          projectId: {
            in: projectIds
          }
        });
      }

      if (statuses && statuses.length > 0) {
        whereClause.AND.push({
          status: {
            in: statuses
          }
        });
      }

      if (priorities && priorities.length > 0) {
        whereClause.AND.push({
          priority: {
            in: priorities
          }
        });
      }

      if (assigneeIds && assigneeIds.length > 0) {
        whereClause.AND.push({
          owners: {
            some: {
              userId: {
                in: assigneeIds
              }
            }
          }
        });
      }

      const orderByClause: any[] = [];
      if (sort && Object.keys(sort).length > 0) {
        Object.entries(sort).forEach((sort: [string, string]) => {
          orderByClause.push({
            [sort[0]]: sort[1]
          });
        });
      }
      if (orderByClause.length === 0) {
        orderByClause.push({ id: 'desc' });
      }

      const tasks = await this.task.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: whereClause,
        orderBy: orderByClause,
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

  getAllOwnedTasks = async ({
    userId,
    limit,
    cursor,
    search,
    projectIds,
    statuses,
    priorities,
    sort
  }: {
    userId: string;
    limit: number;
    cursor?: string;
    search?: string;
    projectIds?: string[];
    statuses?: string[];
    priorities?: string[];
    sort?: Record<string, string>;
  }) => {
    try {
      const whereClause: any = {
        owners: {
          some: {
            userId: userId
          }
        }
      };

      if (search && search.trim()) {
        whereClause.AND = [
          {
            OR: [
              {
                title: {
                  contains: search.trim(),
                  mode: "insensitive"
                }
              },
              {
                description: {
                  contains: search.trim(),
                  mode: "insensitive"
                }
              }
            ]
          }
        ];
      }

      if (projectIds && projectIds.length > 0) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          projectId: {
            in: projectIds
          }
        });
      }

      if (statuses && statuses.length > 0) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          status: {
            in: statuses
          }
        });
      }

      if (priorities && priorities.length > 0) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          priority: {
            in: priorities
          }
        });
      }

      const orderByClause: any[] = [];
      if (sort && Object.keys(sort).length > 0) {
        Object.entries(sort).forEach((sort: [string, string]) => {
          orderByClause.push({
            [sort[0]]: sort[1]
          });
        });
      }
      if (orderByClause.length === 0) {
        orderByClause.push({ id: 'desc' });
      }

      const tasks = await this.task.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: whereClause,
        orderBy: orderByClause,
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

  getTasksByProject = async ({
    projectId,
    userId,
    limit,
    cursor,
    search,
    statuses,
    priorities,
    assigneeIds,
    sort
  }: {
    projectId: string;
    userId: string;
    limit: number;
    cursor?: string;
    search?: string;
    statuses?: string[];
    priorities?: string[];
    assigneeIds?: string[];
    sort?: Record<string, string>;
  }) => {
    try {
      const whereClause: any = {
        projectId
      };

      if (search && search.trim()) {
        whereClause.AND = [
          {
            OR: [
              {
                title: {
                  contains: search.trim(),
                  mode: "insensitive"
                }
              },
              {
                description: {
                  contains: search.trim(),
                  mode: "insensitive"
                }
              }
            ]
          }
        ];
      }

      if (statuses && statuses.length > 0) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          status: {
            in: statuses
          }
        });
      }

      if (priorities && priorities.length > 0) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          priority: {
            in: priorities
          }
        });
      }

      if (assigneeIds && assigneeIds.length > 0) {
        if (!whereClause.AND) whereClause.AND = [];
        whereClause.AND.push({
          owners: {
            some: {
              userId: {
                in: assigneeIds
              }
            }
          }
        });
      }

      const orderByClause: any[] = [];
      if (sort && Object.keys(sort).length > 0) {
        Object.entries(sort).forEach((sort: [string, string]) => {
          orderByClause.push({
            [sort[0]]: sort[1]
          });
        });
      }
      if (orderByClause.length === 0) {
        orderByClause.push({ id: 'desc' });
      }

      const tasks = await this.task.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: whereClause,
        orderBy: orderByClause,
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
    userId,
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
      ownerIds?: string[];
      memberIds?: string[];
    }
  }) => {
    try {
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
        }
      });

      if (!task) {
        return null;
      }

      const { ownerIds: updateOwnerIds, memberIds: updateMemberIds, ...taskUpdateData } = updateData;

      const updatePayload: any = { ...taskUpdateData };

      if (updateData.status === "DONE" && task.status !== "DONE") {
        updatePayload.completedAt = new Date();
      }

      if (updateData.status && updateData.status !== "DONE" && task.status === "DONE") {
        updatePayload.completedAt = null;
      }

      await this.task.update({
        where: {
          id: taskId
        },
        data: updatePayload
      });

      if (updateOwnerIds !== undefined) {
        await this.task.update({
          where: { id: taskId },
          data: {
            owners: {
              deleteMany: {},
              create: updateOwnerIds.map((ownerId) => ({
                userId: ownerId
              }))
            }
          }
        });
      }

      if (updateMemberIds !== undefined) {
        await this.task.update({
          where: { id: taskId },
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

      const ownerUserIds = fullTask.owners.map(owner => owner.userId);
      const memberUserIds = fullTask.members.map(member => member.userId);
      const allUserIds = [...new Set([...ownerUserIds, ...memberUserIds])];

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
