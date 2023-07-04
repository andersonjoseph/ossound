import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import audioService from '../services';

const validationConfig = {
  bodySchema: {
    fileId: { type: 'number' },
    title: {
      type: 'string',
      trim: true,
      min: 1,
      max: 32,
    },
    description: {
      type: 'string',
      trim: true,
      min: 1,
      max: 264,
    },
    $$strict: 'remove',
  },
} as const;

type RequestBody = GetTypeFromValidationSchema<
  typeof validationConfig['bodySchema']
>;

type Request = FastifyRequest<{ Body: RequestBody }>;

export function createAudio(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.post(
    '/audios',
    { config: { validationConfig }, onRequest: [fastify.authenticate] },
    async (request: Request, reply) => {
      const { user } = request;
      const { body } = request;

      const newAudio = await audioService.create({
        ...body,
        userId: Number(user.id),
      });

      reply.status(201).send(newAudio);
    },
  );

  done();
}
