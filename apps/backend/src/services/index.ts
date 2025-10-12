import fp from "fastify-plugin";
import SessionService from "./session.service.js";
import TokenService from "./token.service.js";
import UserService from "./user.service.js";

declare module 'fastify' {
  interface FastifyInstance {
    services: {
      session: SessionService,
      token: TokenService,
      user: UserService
    }
  }
}

export default fp(async (fastify) => {
  fastify.decorate('services', {
    session: new SessionService(fastify.prisma.session),
    token: new TokenService(fastify.jwt),
    user: new UserService(fastify.prisma.user)
  })
})
