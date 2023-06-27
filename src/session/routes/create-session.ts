import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import sessionService from '../services';

const validationConfig = {
  bodySchema: {
    username: { type: 'string', min: '2', max: 32 },
    password: { type: 'string', min: 6, max: 32 },
    $$strict: 'remove',
  },
} as const;

type RequestUserBody = GetTypeFromValidationSchema<
  typeof validationConfig['bodySchema']
>;
type Request = FastifyRequest<{ Body: RequestUserBody }>;

export function createSession(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.post(
    '/session',
    { config: { validationConfig } },
    async (request: Request, reply) => {
      const { body } = request;

      const newUser = await sessionService.create(body);

      const token = fastify.jwt.sign(newUser);

      reply.code(201).send({ token });
    },
  );

  done();
}
