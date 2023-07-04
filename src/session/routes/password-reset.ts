import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { GetTypeFromValidationSchema } from '../../plugins/fastest-validator/types';
import { SerializedUser } from '../../user/tables/users';
import { serializeUser } from '../../user/utils';
import sessionService from '../services';
import { PasswordReset } from '../types';

const validationConfig = {
  bodySchema: {
    username: { type: 'string', min: 2, max: 32 },
    email: { type: 'email' },
    $$strict: 'remove',
  },
} as const;

type RequestBody = GetTypeFromValidationSchema<
  typeof validationConfig['bodySchema']
>;
type Request = FastifyRequest<{ Body: RequestBody }>;
type ResponseBody = Omit<PasswordReset, 'user'> & { user: SerializedUser };

export function createPasswordReset(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.post(
    '/session/password-reset',
    { config: { validationConfig } },
    async (request: Request, reply): Promise<ResponseBody> => {
      const { body } = request;

      const passwordReset = await sessionService.createPasswordReset(body);

      const serializedPasswordReset = {
        ...passwordReset,
        user: serializeUser(passwordReset.user),
      };

      reply.statusCode = 202;

      return serializedPasswordReset;
    },
  );

  done();
}
