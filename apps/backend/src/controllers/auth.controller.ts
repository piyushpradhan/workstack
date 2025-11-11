import { type RouteHandler } from "fastify";
import type SessionService from "../services/session.service.js";
import type TokenService from "../services/token.service.js";
import type UserService from "../services/user.service.js";
import type { RegisterRequest, LoginRequest, RefreshTokenRequest } from "../schemas/auth.schemas.js";
import { compare } from "bcrypt";
import { ResponseHelper } from "../utils/response.js";

class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) { }

  register: RouteHandler<{ Body: RegisterRequest }> = async (request, reply) => {
    try {
      const { name, email, password } = request.body as RegisterRequest;

      await this.userService.createUser({
        name: name || '',
        email,
        password
      });

      return ResponseHelper.success(reply, null, "User registered successfully", 201);
    } catch (error) {
      request.log.error(error, "Error registering user");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to register user");
    }
  };

  login: RouteHandler<{ Body: LoginRequest }> = async (request, reply) => {
    try {
      const { email, password } = request.body as LoginRequest;
      const user = await this.userService.getUserByEmail({ email });

      if (!user) {
        return ResponseHelper.error(reply, "Email or password is invalid", 401, "InvalidCredentials");
      }

      const match = await compare(password, user.password);

      if (!match) {
        return ResponseHelper.error(reply, "Email or password is invalid", 401, "InvalidCredentials");
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
    } catch (error) {
      request.log.error(error, "Error during login");
      return ResponseHelper.error(reply, "Internal server error", 500, "Failed to login");
    }
  };

  refresh: RouteHandler<{ Body: RefreshTokenRequest }> = async (request, reply) => {
    try {
      // Get the session ID from the request
      const sessionId = request.session?.get("sessionId");

      if (!sessionId) {
        return ResponseHelper.error(reply, "No session found", 401, "NoSession");
      }

      // Get the session from database
      const currentSession = await this.sessionService.getSessionById(sessionId);

      if (!currentSession) {
        return ResponseHelper.error(reply, "Session not found", 401, "SessionNotFound");
      }

      // Check if session is expired
      if (currentSession.expiresAt < new Date()) {
        return ResponseHelper.error(reply, "Session expired", 401, "SessionExpired");
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
        return ResponseHelper.error(reply, "User not found", 401, "UserNotFound");
      }

      reply.sendAccessTokenAndSessionId(reply, { accessToken, sessionId, user });
    } catch (error) {
      request.log.error(error, "Error refreshing token");
      return ResponseHelper.error(reply, "Invalid or expired token", 401, "TokenRefreshFailed");
    }
  };
}

export default AuthController;
