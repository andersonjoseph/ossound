import Validator, { ValidationError } from 'fastest-validator';
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  preValidationHookHandler,
} from 'fastify';
import fp from 'fastify-plugin';
import { ValidationConfig } from './types';

function fastestValidator(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  const validator = new Validator();

  fastify.addHook('onRoute', (routeOptions) => {
    if (
      !routeOptions.config ||
      (routeOptions.config && !('validationConfig' in routeOptions.config))
    ) {
      return;
    }

    const validationConfig = routeOptions.config
      ?.validationConfig as ValidationConfig;

    const bodyChecker = validationConfig.bodySchema
      ? validator.compile(validationConfig.bodySchema)
      : undefined;

    const queryChecker = validationConfig.querySchema
      ? validator.compile(validationConfig.querySchema)
      : undefined;

    const paramChecker = validationConfig.paramSchema
      ? validator.compile(validationConfig.paramSchema)
      : undefined;

    function validateSchema(
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void,
    ) {
      const errors = [];
      let result:
        | true
        | ValidationError[]
        | Promise<true | ValidationError[]>
        | undefined;

      result = bodyChecker && bodyChecker(request.body);
      if (Array.isArray(result)) {
        errors.push(...result);
      }

      result = queryChecker && queryChecker(request.query);
      if (Array.isArray(result)) {
        errors.push(...result);
      }

      result = paramChecker && paramChecker(request.params);
      if (Array.isArray(result)) {
        errors.push(...result);
      }

      if (errors.length) {
        reply.status(400).send({
          message: 'Bad Request',
          errors,
        });
      }

      done();
    }

    const existingPreValidationHooks =
      (routeOptions.preValidation as preValidationHookHandler[]) || [];

    routeOptions.preValidation = [
      ...existingPreValidationHooks,
      validateSchema,
    ];
  });

  done();
}

export default fp(fastestValidator);
