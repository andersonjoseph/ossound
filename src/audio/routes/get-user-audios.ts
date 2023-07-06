import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import audioService from '../services';

const validationConfig = {
  paramSchema: {
    id: { type: 'number', trim: true },
  },
  querySchema: {
    after: { type: 'number', optional: true, positive: true, integer: true },
    count: { type: 'number', optional: true, positive: true, integer: true },
    $$strict: true,
  },
} as const;

type ParamsBody = GetTypeFromValidationSchema<
  typeof validationConfig['paramSchema']
>;

type QueryBody = GetTypeFromValidationSchema<
  typeof validationConfig['querySchema']
>;

type Request = FastifyRequest<{ Params: ParamsBody; Querystring: QueryBody }>;

export function getUserAudios(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.get(
    '/users/:id/audios',
    { config: { validationConfig } },
    async (request: Request, reply) => {
      const { id } = request.params;
      const { after, count } = request.query;

      const audios = await audioService.getByUser(id, { after, count });

      reply.code(200).send(audios);
    },
  );

  done();
}
