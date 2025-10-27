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

  getUsersByProjectIds = async ({ projectIds }: { projectIds: string[] }) => {
    try {
      return await this.user.findMany({
        where: {
          projectMemberships: {
            some: {
              projectId: { in: projectIds }
            }
          }
        }
      });
    } catch (error) {
      throw error;
    }
  };
}

export default UserService;
