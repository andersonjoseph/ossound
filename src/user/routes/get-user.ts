import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import userService from '../services';
import { serializeUser } from '../utils';

const validationConfig = {
  paramSchema: {
    id: { type: 'number', trim: true },
  },
} as const;

type ParamsBody = GetTypeFromValidationSchema<
  typeof validationConfig['paramSchema']
>;

type CreateUserRequest = FastifyRequest<{ Params: ParamsBody }>;

export function getUser(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.get(
    '/users/:id',
    { config: { validationConfig } },
    async (request: CreateUserRequest, reply) => {
      const { params } = request;

      const newUser = await userService.getByColumn('id', params.id);

      reply.code(200).send(serializeUser(newUser));
    },
  );

  done();
}
