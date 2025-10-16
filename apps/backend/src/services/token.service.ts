import httpErrors from "http-errors";
import cryptoRandomString from "crypto-random-string";
import type { FastifyJWT, JWT } from "@fastify/jwt";
import { config, TokenTypes } from "../config/index.js";

class TokenService {
  constructor(private jwt: JWT) { }

  generateNonce = () => cryptoRandomString({ length: 16, type: "base64" });

  verifyJwt = (token: string, type: TokenTypes) => {
    let payload;

    try {
      payload = this.jwt.verify<FastifyJWT["user"]>(token);
    } catch (error) {
      if (error instanceof Error) {
        throw new httpErrors.Unauthorized(error.message);
      }

      throw error;
    }

    if (payload.type !== type) {
      throw new httpErrors.Unauthorized("Invalid token type");
    }

    return payload;
  };

  generateAccessToken = ({
    userId,
    nonce,
  }: {
    userId: string;
    nonce: string;
  }) => {
    const accessToken = this.jwt.sign(
      { sub: userId, type: TokenTypes.ACCESS, jti: nonce },
      { expiresIn: config.JWT_EXPIRY },
    );

    return accessToken;
  };

  generateResetPasswordToken = (userId: string) =>
    this.jwt.sign(
      {
        sub: userId,
        type: TokenTypes.RESET_PASSWORD,
        jti: this.generateNonce(),
      },
      { expiresIn: config.RESET_PASSWORD_EXPIRY },
    );
}

export default TokenService;
