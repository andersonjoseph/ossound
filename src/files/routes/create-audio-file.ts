import fastifyMultipart from '@fastify/multipart';
import { randomBytes } from 'crypto';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BadRequest } from '../../plugins/errors/errors';
import fileService from '../services';

export function createAudioFile(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
): void {
  fastify.register(fastifyMultipart, {
    limits: {
      files: 1,
      fileSize: 100_000_000,
    },
  });

  fastify.post(
    '/files',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { user } = request;

      const data = await request.file();

      if (!data || data.mimetype !== 'audio/mpeg') {
        throw new BadRequest();
      }

      const fileName =
        Date.now() + '-' + randomBytes(16).toString('hex') + '.mp3';

      const newFile = await fileService.create(
        {
          fileName,
          mime: data.mimetype,
          userId: Number(user.id),
          isUsed: false,
        },
        data.file,
      );

      reply.status(201).send(newFile);
    },
  );

  done();
}
