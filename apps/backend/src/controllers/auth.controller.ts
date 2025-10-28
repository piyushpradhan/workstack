import { type RouteHandler } from "fastify";
import type SessionService from "../services/session.service.js";
import type TokenService from "../services/token.service.js";
import type UserService from "../services/user.service.js";
import type { RegisterRequest, LoginRequest, RefreshTokenRequest } from "../schemas/auth.schemas.js";
import { compare } from "bcrypt";

class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) { }

  register: RouteHandler<{ Body: RegisterRequest }> = async (request, reply) => {
    const { name, email, password } = request.body as RegisterRequest;

    await this.userService.createUser({
      name: name || '',
      email,
      password
    });

    reply.code(201).send();
  };

  login: RouteHandler<{ Body: LoginRequest }> = async (request, reply) => {
    const { email, password } = request.body as LoginRequest;
    const user = await this.userService.getUserByEmail({ email });

    if (!user) {
      reply.code(401).send("Email or password is invalid");
      return;
    }

    const match = await compare(password, user.password);

    if (!match) {
      reply.code(401).send("Email or password is invalid");
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

    reply.sendAccessTokenAndSessionId(reply, { accessToken, sessionId, user });
  };

  refresh: RouteHandler<{ Body: RefreshTokenRequest }> = async (request, reply) => {
    try {
      // Get the session ID from the request
      const sessionId = request.session?.get("sessionId");

      if (!sessionId) {
        reply.code(401).send({ error: "No session found" });
        return;
      }

      // Get the session from database
      const currentSession = await this.sessionService.getSessionById(sessionId);

      if (!currentSession) {
        reply.code(401).send({ error: "Session not found" });
        return;
      }

      // Check if session is expired
      if (currentSession.expiresAt < new Date()) {
        reply.code(401).send({ error: "Session expired" });
        return;
      }

      // Get the userId from the session
      const userId = currentSession.userId;

      // Generate new nonce and refresh the session
      const nextNonce = this.tokenService.generateNonce();
      await this.sessionService.refreshSession({
        sessionId,
        nonce: currentSession.nonce,
        nextNonce,
      });

      // Generate new access token
      const accessToken = this.tokenService.generateAccessToken({
        userId,
        nonce: nextNonce,
      });

      const user = await this.userService.getUserByUid({ uid: userId });

      if (!user) {
        reply.code(401).send({ error: "User not found" });
        return;
      }

      reply.sendAccessTokenAndSessionId(reply, { accessToken, sessionId, user });
    } catch (error) {
      reply.code(401).send({ error: "Invalid or expired token" });
    }
  };
}

export default AuthController;
