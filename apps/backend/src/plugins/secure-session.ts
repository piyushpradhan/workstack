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
      domain: config.APP_ENV === 'development' ? 'localhost' : config.APP_URL,
      path: '/',
      httpOnly: true,
      // Should be true for production
      secure: config.APP_ENV !== 'development',
    },
  });
});

declare module '@fastify/secure-session' {
  interface SessionData {
    sessionId: string;
  }
}
