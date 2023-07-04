import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import userService from '../services';
import { serializeUser } from '../utils';

const validationConfig = {
  bodySchema: {
    username: {
      type: 'string',
      min: 2,
      max: 32,
      trim: true,
      lowercase: true,
      pattern: /^[a-z0-9_\-.]+$/,
      messages: {
        stringPattern: `username can only contain: letters, numbers '-', '.' and '_'`,
      },
    },
    email: { type: 'email' },
    password: { type: 'string', min: 6, max: 32 },
    $$strict: 'remove',
  },
} as const;

type CreateUserBody = GetTypeFromValidationSchema<
  typeof validationConfig['bodySchema']
>;

type CreateUserRequest = FastifyRequest<{ Body: CreateUserBody }>;

export function createUser(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.post(
    '/users',
    { config: { validationConfig } },
    async (request: CreateUserRequest, reply) => {
      const { body } = request;

      const newUser = await userService.create(body);

      reply.code(201).send(serializeUser(newUser));
    },
  );

  done();
}
