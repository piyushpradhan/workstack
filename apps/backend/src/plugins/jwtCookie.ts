import fp from "fastify-plugin";
import { type FastifyReply, type FastifyRequest } from "fastify";
import httpErrors from "http-errors";
import { config, COOKIES } from "../config/index.js";
import { type User } from "@prisma/client";

interface SendAccessTokenAndSessionId {
  user: User;
  accessToken: string;
  sessionId: string;
  redirectTo?: string;
}

interface JWTCookieOptions {
  path?: string;
  accessibleFromJavascript?: boolean;
  lifespan: "access" | "refresh" | "destroy";
}

const cookieOptions = ({
  path = "/",
  accessibleFromJavascript = false,
  lifespan,
}: JWTCookieOptions) => {
  const age =
    lifespan === "access" ? config.JWT_EXPIRY : config.JWT_REFRESH_EXPIRY;

  return {
    path,
    secure: true,
    sameSite: "none",
    // Don't set domain for cross-origin cookies in production
    // The browser will automatically set it to the server's domain
    domain:
      config.APP_ENV === "development"
        ? "localhost"
        : undefined,
    httpOnly: !accessibleFromJavascript,
    maxAge: lifespan === "destroy" ? 0 : age / 1000,
    expires: lifespan === "destroy" ? new Date(0) : undefined,
  } as const;
};

export const isFromFrontend = (request: FastifyRequest) =>
  request.headers["x-requested-with"] === "XMLHttpRequest";

export const splitJwt = (token: string) => {
  const [headers, payload, signature] = token.split(".");
  const headersAndSignature = `${headers}.${signature}`;

  return { payload, headersAndSignature };
};

export const joinJwt = (payload: string, headersAndSignature: string) => {
  const [headers, signature] = headersAndSignature.split(".");
  return `${headers}.${payload}.${signature}`;
};

export const getAuthorizationBearer = (request: FastifyRequest) => {
  const { authorization } = request.headers;

  if (!authorization) {
    throw httpErrors(401, "No authorization was found in request.headers");
  }

  const parts = authorization.split(" ");
  const [scheme, token] = parts;

  if (parts.length !== 2 || !/^Bearer$/i.test(scheme)) {
    throw httpErrors(401, "Format is Authorization: Bearer [token]");
  }

  return token;
};

export const extractToken = (request: FastifyRequest) => {
  let token;

  try {
    token = getAuthorizationBearer(request);
  } catch (error) {
    if (isFromFrontend(request)) {
      const { cookies } = request;
      const payload = cookies[COOKIES.PAYLOAD];
      const headersAndSignature = cookies[COOKIES.HEADER_SIGNATURE];

      if (!payload || !headersAndSignature) {
        throw httpErrors(401, "No Authorization was found in request.cookies");
      }

      token = joinJwt(payload, headersAndSignature);
    } else {
      throw error;
    }
  }

  return token;
};

export const sendAccessTokenAndSessionId = (
  reply: FastifyReply,
  { accessToken, sessionId, user, redirectTo }: SendAccessTokenAndSessionId,
) => {
  reply.request.session.set("sessionId", sessionId);

  if (isFromFrontend(reply.request) || redirectTo) {
    const { payload, headersAndSignature } = splitJwt(accessToken);

    reply.setCookie(
      COOKIES.PAYLOAD,
      payload,
      cookieOptions({
        accessibleFromJavascript: true,
        lifespan: "refresh",
      }),
    );

    reply.setCookie(
      COOKIES.HEADER_SIGNATURE,
      headersAndSignature,
      cookieOptions({ lifespan: "refresh" }),
    );

    if (redirectTo) reply.redirect(redirectTo);
    else reply.send();

    return;
  }

  reply.send({ token: accessToken, sessionId, user });
};

export const getSessionId = (request: FastifyRequest) => {
  const cookieSession = request.session.get("sessionId");
  if (cookieSession) return cookieSession;

  throw httpErrors(401, "No session was found in request body or cookies");
};

export default fp(async (fastify) => {
  fastify.decorateRequest("getSessionId", getSessionId);
  fastify.decorateReply(
    "sendAccessTokenAndSessionId",
    sendAccessTokenAndSessionId,
  );
});

declare module "fastify" {
  interface FastifyRequest {
    getSessionId: typeof getSessionId;
  }

  interface FastifyReply {
    sendAccessTokenAndSessionId: typeof sendAccessTokenAndSessionId;
  }
}
