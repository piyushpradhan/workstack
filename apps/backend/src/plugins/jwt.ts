import fp from "fastify-plugin";
import type { FastifyRequest, FastifyReply } from "fastify";
import jwt, {
  type FastifyJWTOptions,
} from "@fastify/jwt";
import { extractToken } from "./jwtCookie.js";
import { config, TokenTypes } from "../config/index.js";
import { ResponseHelper } from "../utils/response.js";

const authenticate =
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify({
        decode: {},
        verify: {},
      });
    } catch (error) {
      return ResponseHelper.error(reply, (error as Error).message, 401, "AuthenticationFailed");
    }

    if (request.user.type !== TokenTypes.ACCESS) {
      return ResponseHelper.error(reply, "Invalid token type", 401, "InvalidTokenType");
    }
  };

export default fp<FastifyJWTOptions>(async (fastify) => {
  fastify.register(jwt, {
    secret: config.JWT_SECRET,
    verify: { extractToken },
  });
  fastify.decorate("authenticate", authenticate);
});

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      jti: string;
      type: TokenTypes;
    };
    user: {
      sub: string;
      jti: string;
      type: TokenTypes;
      iat: number;
      exp: number;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
