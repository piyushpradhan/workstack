import { type PrismaClient } from "@prisma/client";

class TasksService {
    constructor(private task: PrismaClient["task"]) { }

    getAllUsersTasks = async ({ userId }: { userId: string }) => {
        try {
            const tasks = await this.task.findMany({
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

            // Transform the data to flatten owners and members
            return tasks.map(task => ({
                ...task,
                owners: task.owners.map(owner => owner.user),
                members: task.members.map(member => member.user)
            }));
        } catch (error) {
            throw error;
        }
    };

    getAllOwnedTasks = async ({ userId }: { userId: string }) => {
        try {
            const tasks = await this.task.findMany({
                where: {
                    owners: {
                        some: {
                            userId: userId
                        }
                    }
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

            // Transform the data to flatten owners
            return tasks.map(task => ({
                ...task,
                owners: task.owners.map(owner => owner.user)
            }));
        } catch (error) {
            throw error;
        }
    };

    getTasksByProject = async ({ projectId, userId }: { projectId: string; userId: string }) => {
        try {
            const tasks = await this.task.findMany({
                where: {
                    projectId,
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

            // Transform the data to flatten owners and members
            return tasks.map(task => ({
                ...task,
                owners: task.owners.map(owner => owner.user),
                members: task.members.map(member => member.user)
            }));
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
            return await this.task.create({
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
        } catch (error) {
            throw error;
        }
    };

    getTaskById = async ({ taskId, userId }: { taskId: string; userId: string }) => {
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
            return {
                ...task,
                owners: task.owners.map(owner => owner.user),
                members: task.members.map(member => member.user)
            };
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
        }
    }) => {
        try {
            // First check if user is an owner of the task
            const task = await this.task.findFirst({
                where: {
                    id: taskId,
                    owners: {
                        some: {
                            userId: userId
                        }
                    }
                }
            });

            if (!task) {
                return null;
            }

            const updatePayload: any = { ...updateData };

            // If status is being updated to DONE, set completedAt
            if (updateData.status === 'DONE' && task.status !== 'DONE') {
                updatePayload.completedAt = new Date();
            }

            // If status is being updated from DONE to something else, clear completedAt
            if (updateData.status && updateData.status !== 'DONE' && task.status === 'DONE') {
                updatePayload.completedAt = null;
            }

            return await this.task.update({
                where: {
                    id: taskId
                },
                data: updatePayload
            });
        } catch (error) {
            throw error;
        }
    };

    deleteTask = async ({ taskId, userId }: { taskId: string; userId: string }) => {
        try {
            // First check if user is an owner of the task
            const task = await this.task.findFirst({
                where: {
                    id: taskId,
                    owners: {
                        some: {
                            userId: userId
                        }
                    }
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

            return true;
        } catch (error) {
            throw error;
        }
    };
}

export default TasksService;
