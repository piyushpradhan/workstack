import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FastifyServerOptions, FastifyInstance } from 'fastify';
import fastify from 'fastify';

import autoload from '@fastify/autoload';
import helmet from '@fastify/helmet';

import services from './services/index.js';
import controllers from './controllers/index.js';
import rootRoutes from './routes/root.js';
import authRoutes from './routes/auth/index.js';

const dir = dirname(fileURLToPath(import.meta.url));

const build = (opts: FastifyServerOptions) => {
  const app: FastifyInstance = fastify(opts);

  app.register(helmet);

  app.register(autoload, {
    dir: join(dir, 'plugins'),
  });

  app.register(services);
  app.register(controllers);

  // Register routes manually instead of using autoload
  console.log('Registering root routes...');
  app.register(rootRoutes);
  console.log('Registering auth routes...');
  app.register(authRoutes, { prefix: '/auth' });
  console.log('Routes registered successfully');

  return app;
};

export default build;
