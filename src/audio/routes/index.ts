import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createAudio } from './create-audio';
import { getAudio } from './get-audio';
import { getUserAudios } from './get-user-audios';
import { removeAudio } from './remove-audio';
import { updateAudio } from './update-audio';

export function audioRoutes(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.register(createAudio);
  fastify.register(getAudio);
  fastify.register(getUserAudios);
  fastify.register(removeAudio);
  fastify.register(updateAudio);
  done();
}
