import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
  preSerializationHookHandler,
  preValidationHookHandler,
} from 'fastify';
import Hashids from 'hashids';
import fp from 'fastify-plugin';
import { BadRequest } from '../errors/errors';
import { NumberLike } from 'hashids/cjs/util';

type HashidsPluginOptions = {
  hashidsOptions?: {
    global?: boolean;
  };
};

function hashidsPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions & HashidsPluginOptions,
  done: (err?: Error) => void,
): void {
  const hashids = new Hashids();

  const idRegex = /(id|\w+Id$)/;

  function decode(id: string): NumberLike {
    try {
      return hashids.decode(id)[0] || -1;
    } catch (err) {
      throw new BadRequest();
    }
  }

  function isObject(payload: unknown): payload is Record<string, unknown> {
    const typeOfPayload = Object.prototype.toString.call(payload);

    return typeOfPayload === '[object Object]';
  }

  function isArray(payload: unknown): payload is Array<unknown> {
    return Array.isArray(payload);
  }

  function hashIdsOnArray(arr: unknown[]): unknown[] {
    const outputArray: Array<unknown> = [];

    for (const value of arr) {
      if (isObject(value)) {
        outputArray.push(hashIdsOnObject(value));
      } else if (isArray(value)) {
        outputArray.push(...hashIdsOnArray(value));
      } else {
        outputArray.push(value);
      }
    }

    return outputArray;
  }

  function hashIdsOnObject(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const outputObject: Record<string, unknown> = JSON.parse(
      JSON.stringify(obj),
    );

    const keys = Object.keys(outputObject);

    for (const key of keys) {
      const currentValue = outputObject[key];

      if (isObject(currentValue)) {
        outputObject[key] = hashIdsOnObject(currentValue);
      } else if (isArray(currentValue)) {
        outputObject[key] = hashIdsOnArray(currentValue);
      } else if (idRegex.test(key)) {
        outputObject[key] = hashids.encode(String(outputObject[key]));
      }
    }

    return outputObject;
  }

  fastify.addHook('onRoute', (routeOptions) => {
    const isHashidsConfigEnabled =
      !!routeOptions.config &&
      'hashids' in routeOptions.config &&
      routeOptions.config.hashids === true;
    const isGlobalOptionDefined = !!options.hashidsOptions?.global;

    if (!isHashidsConfigEnabled && !isGlobalOptionDefined) {
      return;
    }

    function hashIdsInPayload(
      _: FastifyRequest,
      __: FastifyReply,
      payload: unknown,
      done: (err?: Error | null, payload?: unknown) => void,
    ): void {
      let newPayload: unknown;

      if (isArray(payload)) {
        newPayload = hashIdsOnArray(payload);
      } else if (isObject(payload)) {
        newPayload = hashIdsOnObject(payload);
      } else {
        newPayload = hashids.encode(String(payload));
      }

      done(null, newPayload);
    }

    function hashIdsInParams(
      request: FastifyRequest,
      _: FastifyReply,
      done: (err?: Error) => void,
    ): void {
      if (!(request.params instanceof Object) || !('id' in request.params)) {
        return done();
      }

      const { id } = request.params;

      request.params.id = decode(String(id));
      done();
    }

    function hashIdsInBody(
      request: FastifyRequest,
      __: FastifyReply,
      done: (err?: Error) => void,
    ): void {
      if (request.body === null || typeof request.body !== 'object') {
        return done();
      }

      const body = request.body as Record<string, unknown>;

      const keys = Object.keys(body) as (keyof typeof body)[];

      for (const key of keys) {
        if (idRegex.test(key)) {
          body[key] = decode(String(body[key]));
        }
      }

      done();
    }

    const existingPreValidationHooks =
      (routeOptions.preValidation as preValidationHookHandler[]) || [];

    routeOptions.preValidation = [
      hashIdsInParams,
      hashIdsInBody,
      ...existingPreValidationHooks,
    ];

    const existingPreSerializationHooks =
      (routeOptions.preSerialization as preSerializationHookHandler<unknown>[]) ||
      [];

    routeOptions.preSerialization = [
      hashIdsInPayload,
      ...existingPreSerializationHooks,
    ];
  });

  done();
}

export default fp(hashidsPlugin);
