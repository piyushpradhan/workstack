import { type RouteHandler } from 'fastify';
import type SessionService from '../services/session.service.js';
import type TokenService from '../services/token.service.js';
import type UserService from '../services/user.service.js';
import type { Register, Login } from '../validations/auth.js';
import { compare } from 'bcrypt';

class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) {}

  register: RouteHandler<{ Body: Register }> = async (request, reply) => {
    const { name, email, password } = request.body;

    await this.userService.createUser({ name, email, password });

    reply.code(201).send();
  };

  login: RouteHandler<{ Body: Login }> = async (request, reply) => {
    const { email, password } = request.body;
    const user = await this.userService.getUserByEmail({ email });

    if (!user) {
      reply.code(401).send('Email or password is invalid');
      return;
    }

    const match = await compare(password, user.password);

    if (!match) {
      reply.code(401).send('Email or password is invalid');
      return;
    }

    const nonce = this.tokenService.generateNonce();
    const { id: sessionId } = await this.sessionService.createSession({
      userId: user.id,
      nonce,
    });

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      nonce,
    });

    reply.sendAccessTokenAndSessionId(reply, { accessToken, sessionId });
  };
}

export default AuthController;
