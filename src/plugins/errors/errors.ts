import createError from '@fastify/error';

export class FastifyError extends Error {
  constructor() {
    super();
  }
}

export const UnauthorizedError = createError(
  'FST_UNAUTHORIZED',
  'username or password incorrect.',
  401,
  // @ts-expect-error a TS error here is expected untils this merges: https://github.com/fastify/fastify-error/pull/108
  FastifyError,
);

export const NotFound = createError(
  'FST_NOT_FOUND',
  'not found',
  404,
  // @ts-expect-error a TS error here is expected untils this merges: https://github.com/fastify/fastify-error/pull/108
  FastifyError,
);

export const Conflict = createError(
  'FST_CONFLICT',
  'conflict',
  409,
  // @ts-expect-error a TS error here is expected untils this merges: https://github.com/fastify/fastify-error/pull/108
  TypeError,
);

export const BadRequest = createError(
  'FST_BAD_REQUEST',
  'bad request',
  400,
  // @ts-expect-error a TS error here is expected untils this merges: https://github.com/fastify/fastify-error/pull/108
  TypeError,
);

export const Forbidden = createError(
  'FST_FORBIDDEN',
  'forbidden',
  403,
  // @ts-expect-error a TS error here is expected untils this merges: https://github.com/fastify/fastify-error/pull/108
  TypeError,
);
