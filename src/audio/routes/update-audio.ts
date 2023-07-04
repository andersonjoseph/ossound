import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { Forbidden } from '../../plugins/errors/errors';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import audioService from '../services';

const validationConfig = {
  paramSchema: {
    id: { type: 'number', trim: true },
    $$strict: 'remove',
  },
  bodySchema: {
    title: {
      type: 'string',
      trim: true,
      min: 1,
      max: 32,
      optional: true,
    },
    description: {
      type: 'string',
      trim: true,
      min: 1,
      max: 264,
      optional: true,
    },
    $$strict: 'remove',
  },
} as const;

type ParamsBody = GetTypeFromValidationSchema<
  typeof validationConfig['paramSchema']
>;

type RequestBody = GetTypeFromValidationSchema<
  typeof validationConfig['bodySchema']
>;

type Request = FastifyRequest<{ Params: ParamsBody; Body: RequestBody }>;

export function updateAudio(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.patch(
    '/audios/:id',
    { config: { validationConfig }, onRequest: [fastify.authenticate] },
    async (request: Request, reply) => {
      const { user } = request;
      const { body } = request;
      const { id } = request.params;

      const audio = await audioService.getByColumn('id', id);

      if (audio.userId !== Number(user.id)) {
        const forbiddenErr = new Forbidden();
        forbiddenErr.message = 'You do not have permission to edit the audio';

        throw forbiddenErr;
      }

      const updatedAudio = await audioService.update(audio, body);

      reply.code(200).send(updatedAudio);
    },
  );

  done();
}
