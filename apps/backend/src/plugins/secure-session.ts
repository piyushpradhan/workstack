import fp from 'fastify-plugin';
import secureSession, {
  type SecureSessionPluginOptions,
} from '@fastify/secure-session';
import { config, COOKIES } from '../config/index.js';

export default fp<SecureSessionPluginOptions>(async (fastify) => {
  fastify.register(secureSession, {
    cookieName: COOKIES.SESSION,
    // Use the same keys as JWT for consistency
    key: config.KEYS,
    cookie: {
      // Don't set domain for cross-origin cookies in production
      // The browser will automatically set it to the server's domain
      domain: config.APP_ENV === 'development' ? 'localhost' : undefined,
      path: '/',
      httpOnly: true,
      // Should be true for production
      secure: config.APP_ENV !== 'development',
      sameSite: config.APP_ENV === 'development' ? 'lax' : 'none',
    },
  });
});

declare module '@fastify/secure-session' {
  interface SessionData {
    sessionId: string;
  }
}
