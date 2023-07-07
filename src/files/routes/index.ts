import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createAudioFile } from './create-audio-file';
import { removeAudioFile } from './delete-audio-file';
import { getFile } from './get-file';

export function fileRoutes(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.register(createAudioFile);
  fastify.register(removeAudioFile);
  fastify.register(getFile);

  done();
}
