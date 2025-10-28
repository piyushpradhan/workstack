import { type Prisma, type PrismaClient } from "@prisma/client";
import httpErrors from "http-errors";

import { config } from "../config/index.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type SessionCompoundUnique = Prisma.SessionUserIdNonceCompoundUniqueInput;

interface UpdateSession {
  sessionId: string;
  nonce: string;
  nextNonce: string;
}

export class SessionService {
  constructor(private session: PrismaClient["session"]) { }

  createSession = async ({ userId, nonce }: SessionCompoundUnique) => {
    const expires = new Date(Date.now() + config.JWT_REFRESH_EXPIRY);

    return this.session.create({
      data: { userId, nonce, expiresAt: expires },
    });
  };

  refreshSession = async ({ sessionId, nonce, nextNonce }: UpdateSession) => {
    const now = new Date();
    const newExpires = new Date(Date.now() + config.JWT_REFRESH_EXPIRY);

    let session;

    try {
      session = await this.session.findUnique({
        where: { id: sessionId },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2023") {
          throw new httpErrors.Unauthorized(
            "You have been logged out. Please login again",
          );
        }
      }

      throw error;
    }

    if (!session) {
      throw new httpErrors.Unauthorized(
        "You have been logged out. Please login again",
      );
    }

    // Compromised session. Revoke the token
    if (session.nonce !== nonce) {
      await this.session.delete({ where: { id: sessionId } });
      throw new httpErrors.Unauthorized("You are not logged in");
    }

    if (session.expiresAt < now) {
      throw new httpErrors.Unauthorized(
        "Session has expired. Please login again",
      );
    }

    return this.session.update({
      where: { id: sessionId },
      data: { nonce: nextNonce, expiresAt: newExpires },
    });
  };

  listSessions = async ({ userId }: { userId: string }) =>
    this.session.findMany({
      where: { userId },
    });

  getSessionById = async (sessionId: string) =>
    this.session.findUnique({
      where: { id: sessionId },
    });

  deleteSessionsById = async (sessionId: string) => {
    try {
      return await this.session.delete({
        where: { id: sessionId },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") return null;
      }

      throw error;
    }
  };
}

export default SessionService;
