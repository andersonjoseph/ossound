import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { FastifyError } from './errors';

export function errorHandlers(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.setErrorHandler((error, _, reply) => {
    if (error instanceof FastifyError) {
      reply.code(Number(error.statusCode)).send({
        message: error.message,
      });
    }
  });

  done();
}
