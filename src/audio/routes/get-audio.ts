import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import audioService from '../services';

const validationConfig = {
  paramSchema: {
    id: { type: 'number', trim: true },
  },
} as const;

type ParamsBody = GetTypeFromValidationSchema<
  typeof validationConfig['paramSchema']
>;

type Request = FastifyRequest<{ Params: ParamsBody }>;

export function getAudio(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.get(
    '/audios/:id',
    { config: { validationConfig } },
    async (request: Request, reply) => {
      const { params } = request;

      const audio = await audioService.getByColumn('id', params.id);

      reply.code(200).send(audio);
    },
  );

  done();
}
