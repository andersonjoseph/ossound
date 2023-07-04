import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';

export function getSession(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.get(
    '/session',
    { onRequest: fastify.authenticate },
    async (request: FastifyRequest, reply) => {
      const { user } = request;

      reply.code(200).send(user);
    },
  );

  done();
}
