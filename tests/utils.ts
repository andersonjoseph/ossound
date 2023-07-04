import {
  randEmail,
  randFirstName,
  randPassword,
  randText,
} from '@ngneat/falso';
import userService from '../src/user/services';
import { SerializedUser } from '../src/user/tables/users';
import server from '../src/server';
import formAutoContent from 'form-auto-content';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { File } from '../src/files/tables/files';
import { SerializedAudio } from '../src/audio/tables/audios';

type RandomUserResponse = {
  input: Parameters<typeof userService['create']>[0];
  data: SerializedUser;
};

async function createRandomUser(): Promise<RandomUserResponse> {
  const email = randEmail();
  const username = randFirstName({ withAccents: false }).toLowerCase();
  const password = randPassword();

  const response = await server.inject({
    url: '/users',
    method: 'post',
    body: {
      email,
      username,
      password,
    },
  });

  const JSONBody = JSON.parse(response.body);

  return {
    input: {
      email,
      username,
      password,
    },
    data: JSONBody,
  };
}

async function createSession(data: { username: string; password: string }) {
  const response = await server.inject({
    url: '/session',
    method: 'post',
    body: {
      username: data.username,
      password: data.password,
    },
  });

  const JSONBody = JSON.parse(response.body);

  return JSONBody;
}

async function createRandomAudioFile(session: {
  token: string;
}): Promise<File> {
  const form = formAutoContent(
    {
      file: createReadStream(
        path.join(__dirname, 'file', 'files', 'audio.mp3'),
      ),
    },
    { payload: 'body' },
  );

  const response = await server.inject({
    url: '/files/audios',
    method: 'post',
    body: form.body,
    headers: {
      ...form.headers,
      authorization: `Bearer ${session.token}`,
    },
  });

  const JSONBody = JSON.parse(response.body);

  return JSONBody;
}

async function createRandomAudio(session: {
  token: string;
}): Promise<SerializedAudio> {
  const file = await createRandomAudioFile(session);

  const response = await server.inject({
    url: '/audios',
    method: 'post',
    body: {
      title: randText(),
      description: randText(),
      fileId: file.id,
    },
    headers: {
      authorization: `Bearer ${session.token}`,
    },
  });

  const JSONBody = JSON.parse(response.body);

  return JSONBody;
}

export default {
  createRandomUser,
  createSession,
  createRandomAudioFile,
  createRandomAudio,
};
