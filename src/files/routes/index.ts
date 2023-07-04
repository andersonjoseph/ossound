import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createAudioFile } from './create-audio-file';
import { removeAudioFile } from './delete-audio-file';

export function fileRoutes(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.register(createAudioFile);
  fastify.register(removeAudioFile);

  done();
}
