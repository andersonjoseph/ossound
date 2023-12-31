import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { Forbidden } from '../../plugins/errors/errors';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import fileService from '../services';

const validationConfig = {
  paramSchema: {
    id: { type: 'number' },
  },
} as const;

type ParamsBody = GetTypeFromValidationSchema<
  typeof validationConfig['paramSchema']
>;

type Request = FastifyRequest<{ Params: ParamsBody }>;

export function removeAudioFile(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.delete(
    '/files/:id',
    { config: { validationConfig }, onRequest: [fastify.authenticate] },
    async (request: Request, reply) => {
      const { user } = request;
      const { id } = request.params;

      const file = await fileService.getByColumn('id', id);

      if (file.userId !== Number(user.id)) {
        const forbiddenErr = new Forbidden();
        forbiddenErr.message = 'You do not have permission to delete the file';

        throw forbiddenErr;
      }

      await fileService.remove(file);

      reply.status(204).send();
    },
  );

  done();
}
