import { type PrismaClient } from "@prisma/client";

class ProjectsService {
  constructor(private project: PrismaClient["project"]) { }

  getAllUsersProjects = async ({ userId }: { userId: string }) => {
    try {
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
    } catch (error) {
      throw error;
    }
  };

  getAllOwnedProjects = async ({ userId }: { userId: string }) => {
    try {
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
    } catch (error) {
      throw error;
    }
  };

  createProject = async ({ name, description, ownerId }: { name: string; description?: string; ownerId: string }) => {
    try {
      return await this.project.create({
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
    } catch (error) {
      throw error;
    }
  };

  getProjectById = async ({ projectId, userId }: { projectId: string; userId: string }) => {
    try {
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
        }
      });

      if (!project) {
        return null;
      }

      return await this.project.update({
        where: {
          id: projectId
        },
        data: updateData
      });
    } catch (error) {
      throw error;
    }
  };

  deleteProject = async ({ projectId, userId }: { projectId: string; userId: string }) => {
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

      return true;
    } catch (error) {
      throw error;
    }
  };
}

export default ProjectsService;
