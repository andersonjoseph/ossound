import fastifyMultipart from '@fastify/multipart';
import { randomBytes } from 'crypto';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { BadRequest } from '../../plugins/errors/errors';
import fileService from '../services';

export function createAudioFile(
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: (err?: Error) => void,
) {
  fastify.register(fastifyMultipart, {
    limits: {
      files: 1,
      fileSize: 100_000_000,
    },
  });

  fastify.post(
    '/files/audios',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const { user } = request;

      const data = await request.file();

      if (!data || data.mimetype !== 'audio/mpeg') {
        throw new BadRequest();
      }

      const fileName =
        Date.now() + '-' + randomBytes(16).toString('hex') + '.mp3';

      const newFile = await fileService.create({
        fileName,
        mime: data.mimetype,
        userId: Number(user.id),
        isUsed: false,
      });

      const writeStream = createWriteStream(
        path.join(__dirname, '..', '..', '..', 'uploads', `${fileName}`),
      );

      await pipeline(data.file, writeStream);
      reply.status(201).send(newFile);
    },
  );

  done();
}
