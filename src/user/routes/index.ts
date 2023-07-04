import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createUser } from './create-user';
import { getUser } from './get-user';
import { updateUser } from './update-user';

export function usersRoutes(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.register(createUser);
  fastify.register(getUser);
  fastify.register(updateUser);

  done();
}
