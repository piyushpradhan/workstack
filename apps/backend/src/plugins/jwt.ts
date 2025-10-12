import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt, { type FastifyJWTOptions, type FastifyJwtVerifyOptions } from '@fastify/jwt';
import { extractToken } from "./jwtCookie.js";
import { config, TokenTypes } from '../config/index.js';

const authenticate = (opts: FastifyJwtVerifyOptions['verify'] = {}) => async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify({
      decode: {},
      verify: opts
    });
  } catch (error) {
    reply.code(401).send({ error: (error as Error).message });
  }

  if (request.user.type !== TokenTypes.ACCESS) {
    reply.code(401).send({ error: 'Invalid token type' });
  }
}

export default fp<FastifyJWTOptions>(async (fastify) => {
  fastify.register(jwt, {
    secret: config.JWT_SECRET,
    verify: { extractToken }
  })
  fastify.decorate('authenticate', authenticate)
})

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string
      jti: string
      type: TokenTypes
    }
    user: {
      sub: string
      jti: string
      type: TokenTypes
      iat: number
      exp: number
    }
  }
}
