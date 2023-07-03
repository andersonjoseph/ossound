import Fastify, { FastifyRequest } from 'fastify';
import fastestValidator from './plugins/fastest-validator';
import { usersRoutes } from './user/routes';
import { fastifyJwt } from '@fastify/jwt';
import fp from 'fastify-plugin';
import { sessionRoutes } from './session/routes';
import { errorHandlers } from './plugins/errors';
import hashidsPlugin from './plugins/hashids';

declare module 'fastify' {
  export interface FastifyInstance {
    getEnvironmentVariableOrThrow: (variable: string) => string;
    authenticate: (...args: unknown[]) => Promise<void>;
  }
}

const fastify = Fastify({
  logger: false,
});

// plugins
fastify.decorate(
  'getEnvironmentVariableOrThrow',
  (variable: string): string => {
    if (process.env[variable] === undefined) {
      throw new Error(`Environment '${variable}' variable is not defined `);
    }

    return process.env[variable] as string;
  },
);

fastify.register(
  fp(async (fastify) => {
    fastify.register(fastifyJwt, {
      secret: fastify.getEnvironmentVariableOrThrow('JWT_SECRET'),
    });

    fastify.decorate('authenticate', async (request: FastifyRequest) => {
      await request.jwtVerify();
    });
  }),
);

fastify.register(errorHandlers);
fastify.register(fastestValidator);
fastify.register(hashidsPlugin, {
  hashidsOptions: {
    global: true,
  },
});

// routes
fastify.register(usersRoutes);
fastify.register(sessionRoutes);

export default fastify;
