import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import userService from '../services';
import { serializeUser } from '../utils';

const validationConfig = {
  paramSchema: {
    id: { type: 'number', trim: true },
  },
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
      optional: true,
    },
    email: { type: 'email', optional: true },
  },
} as const;

type ParamsBody = GetTypeFromValidationSchema<
  typeof validationConfig['paramSchema']
>;
type RequestBody = GetTypeFromValidationSchema<
  typeof validationConfig['bodySchema']
>;

type CreateUserRequest = FastifyRequest<{
  Params: ParamsBody;
  Body: RequestBody;
}>;

export function updateUser(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.patch(
    '/users/:id',
    { config: { validationConfig } },
    async (request: CreateUserRequest, reply) => {
      const { params } = request;
      const { body } = request;

      const user = await userService.getByColumn('id', params.id);

      const updatedUser = await userService.update(user, body);

      reply.code(200).send(serializeUser(updatedUser));
    },
  );

  done();
}
