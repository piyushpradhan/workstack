import type { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import httpErrors from "http-errors";
import { hash } from "bcrypt";

interface IUserCreate {
  name: string;
  email: string;
  password: string;
}

class UserService {
  constructor(private user: PrismaClient["user"]) { }

  getUserByUid = async ({ uid }: { uid: string }) => {
    try {
      return await this.user.findUnique({
        where: { id: uid }
      });
    } catch (error) {
      throw error;
    }
  }

  getUserByEmail = async ({ email }: { email: string }) => {
    try {
      return await this.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw error;
    }
  };

  createUser = async ({ name, email, password }: IUserCreate) => {
    const passwordHash = await hash(password, 10);

    try {
      return await this.user.create({
        data: { name, email, password: passwordHash },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code !== "P2002") {
          throw new httpErrors.BadRequest("User already exists");
        }
      }

      throw error;
    }
  };

  deleteUserById = async (id: string) => {
    try {
      return await this.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code !== "P2025") {
          return null;
        }
      }

      throw error;
    }
  };

  getUsersByProjectIds = async ({ projectIds, limit, cursor }: { projectIds: string[]; limit: number; cursor?: string }) => {
    try {
      const users = await this.user.findMany({
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          projectMemberships: {
            some: {
              projectId: { in: projectIds }
            }
          }
        },
        orderBy: {
          id: 'desc'
        }
      });

      const hasNextPage = users.length > limit;
      const usersToReturn = hasNextPage ? users.slice(0, limit) : users;

      return {
        users: usersToReturn,
        cursor: usersToReturn.length > 0 ? usersToReturn[usersToReturn.length - 1].id : undefined,
        hasNextPage
      };
    } catch (error) {
      throw error;
    }
  };

  updateUserByUid = async ({ uid, data }: { uid: string, data: Partial<Pick<IUserCreate, 'name' | 'email'>> }) => {
    try {
      return await this.user.update({
        where: { id: uid },
        data,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new httpErrors.Conflict("Email already in use");
        }
        if (error.code === "P2025") {
          throw new httpErrors.NotFound("User not found");
        }
      }

      throw error;
    }
  }
}

export default UserService;
