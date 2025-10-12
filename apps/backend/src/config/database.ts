import { config } from './index.js';

export const databaseConfig = {
  url: config.DATABASE_URL,
  options: {
    ssl:
      config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};
