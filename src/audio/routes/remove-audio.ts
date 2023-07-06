import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { Forbidden } from '../../plugins/errors/errors';
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

export function removeAudio(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.delete(
    '/audios/:id',
    { config: { validationConfig }, onRequest: [fastify.authenticate] },
    async (request: Request, reply) => {
      const { user } = request;
      const { id } = request.params;

      const audio = await audioService.getByColumn('id', id);

      if (audio.userId !== Number(user.id)) {
        const forbiddenErr = new Forbidden();
        forbiddenErr.message = 'You do not have permission to delete the audio';

        throw forbiddenErr;
      }

      await audioService.remove(audio);

      reply.code(204).send();
    },
  );

  done();
}
