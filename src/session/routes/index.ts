import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createSession } from './create-session';
import { getSession } from './get-session';
import { createPasswordReset } from './password-reset';

export function sessionRoutes(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.register(createSession);
  fastify.register(createPasswordReset);
  fastify.register(getSession);

  done();
}
