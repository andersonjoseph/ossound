import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
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

export function getFile(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.get(
    '/files/:id',
    { config: { validationConfig } },
    async (request: Request, reply) => {
      const { id } = request.params;

      const file = await fileService.getByColumn('id', id);
      const fileStream = fileService.getFileStream(file.fileName);

      return reply
        .header('Content-Type', 'application/octet-stream')
        .type(file.mime)
        .status(200)
        .send(fileStream);
    },
  );

  done();
}
