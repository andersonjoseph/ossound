import assert from 'node:assert';
import testUtils from '../utils';
import { beforeEach, describe, test } from 'node:test';
import server from '../../src/server';
import formAutoContent from 'form-auto-content';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { SerializedUser } from '../../src/user/tables/users';
import { randNumber } from '@ngneat/falso';

describe('DELETE /files/audios/:id', () => {
  let user: {
    input: { email: string; username: string; password: string };
    data: SerializedUser;
  };

  let session: { token: string };

  beforeEach(async () => {
    user = await testUtils.createRandomUser();

    session = await testUtils.createSession({
      username: user.data.username,
      password: user.input.password,
    });
  });

  test('return status 401 if user is not authenticated', async () => {
    const response = await server.inject({
      url: `/files/${randNumber()}`,
      method: 'delete',
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 401, 'statusCode is 401');
    assert.deepStrictEqual(JSONBody, {
      statusCode: 401,
      code: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
      error: 'Unauthorized',
      message: 'No Authorization was found in request.headers',
    });
  });

  test('return status 404 if file does not exists', async () => {
    const response = await server.inject({
      url: `/files/${randNumber()}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    assert.strictEqual(response.statusCode, 404, 'statusCode is 404');
  });

  test('return status 403 if user does not have permission to delete the file', async () => {
    const otherUser = await testUtils.createRandomUser();
    const otherSession = await testUtils.createSession({
      username: otherUser.data.username,
      password: otherUser.input.password,
    });

    const file = await testUtils.createRandomAudioFile(otherSession);

    const response = await server.inject({
      url: `/files/${file.id}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    assert.strictEqual(response.statusCode, 403, 'statusCode is 403');
  });

  test('return status 204 on success', async () => {
    const file = await testUtils.createRandomAudioFile(session);

    const response = await server.inject({
      url: `/files/${file.id}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    assert.strictEqual(response.statusCode, 204, 'statusCode is 204');
  });
});

describe('POST /files/audios', () => {
  let user: {
    input: { email: string; username: string; password: string };
    data: SerializedUser;
  };

  let session: { token: string };

  beforeEach(async () => {
    user = await testUtils.createRandomUser();

    session = await testUtils.createSession({
      username: user.data.username,
      password: user.input.password,
    });
  });

  test('return status 401 if user is not authenticated', async () => {
    const response = await server.inject({
      url: '/files/audios',
      method: 'post',
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 401, 'statusCode is 401');
    assert.deepStrictEqual(JSONBody, {
      statusCode: 401,
      code: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
      error: 'Unauthorized',
      message: 'No Authorization was found in request.headers',
    });
  });

  describe('return status 400 if file is not valid', () => {
    test('file not valid', async () => {
      const form = formAutoContent(
        {
          file: createReadStream(path.join(__dirname, 'files', 'test.txt')),
        },
        { payload: 'body' },
      );

      const response = await server.inject({
        url: '/files/audios',
        method: 'post',
        headers: {
          ...form.headers,
          authorization: `Bearer ${session.token}`,
        },
        body: form.body,
      });

      assert.strictEqual(response.statusCode, 400, 'statusCode is 400');
    });

    test('file missing', async () => {
      const form = formAutoContent({}, { payload: 'body' });

      const response = await server.inject({
        url: '/files/audios',
        method: 'post',
        headers: {
          ...form.headers,
          authorization: `Bearer ${session.token}`,
        },
        body: form.body,
      });

      assert.strictEqual(response.statusCode, 415, 'statusCode is 415');
    });
  });

  test('return status 201', async () => {
    const form = formAutoContent(
      {
        file: createReadStream(path.join(__dirname, 'files', 'audio.mp3')),
      },
      { payload: 'body' },
    );

    const response = await server.inject({
      url: '/files/audios',
      method: 'post',
      headers: {
        ...form.headers,
        authorization: `Bearer ${session.token}`,
      },
      body: form.body,
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 201, 'statusCode is 400');
    assert.strictEqual(typeof JSONBody.id, 'string', 'id is string');
    assert.strictEqual(
      typeof JSONBody.fileName,
      'string',
      'fileName is string',
    );
    assert.strictEqual(typeof JSONBody.mime, 'string', 'mime is string');
    assert.strictEqual(JSONBody.isUsed, false, 'isUsed is false');
    assert.strictEqual(typeof JSONBody.userId, 'string', 'userId is string');
  });
});
