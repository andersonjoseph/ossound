import { beforeEach, describe, test } from 'node:test';
import testUtils from '../utils';
import server from '../../src/server';
import assert from 'node:assert';
import { SerializedUser } from '../../src/user/tables/users';
import { randNumber, randText } from '@ngneat/falso';
import { Audio } from '../../src/audio/tables/audios';

function assertAudio(data: Audio): void {
  assert.equal(typeof data.id, 'string', 'id is a string');
  assert.equal(typeof data.title, 'string', 'title is a string');
  assert.equal(typeof data.description, 'string', 'description is a string');
  assert.equal(data.playCount, 0, 'playCount is 0');
  assert.ok('userId' in data, 'userId is defined');
}

describe('PATCH /audios/:id', () => {
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
      url: `/audios/${randNumber()}`,
      method: 'patch',
      body: {},
    });

    assert.strictEqual(response.statusCode, 401, 'statusCode is 401');
  });

  test('return status 404 if audio does not exists', async () => {
    const response = await server.inject({
      url: `/audios/${randNumber()}`,
      method: 'patch',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
      body: {},
    });

    assert.strictEqual(response.statusCode, 404, 'statusCode is 404');
  });

  test('return status 403 if user does not have permission to delete the audio', async () => {
    const otherUser = await testUtils.createRandomUser();
    const otherSession = await testUtils.createSession({
      username: otherUser.data.username,
      password: otherUser.input.password,
    });

    const audio = await testUtils.createRandomAudio(otherSession);

    const response = await server.inject({
      url: `/audios/${audio.id}`,
      method: 'patch',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
      body: {},
    });

    assert.strictEqual(response.statusCode, 403, 'statusCode is 403');
  });

  test('return status 200 on success', async () => {
    const randomAudio = await testUtils.createRandomAudio(session);

    const response = await server.inject({
      url: `/audios/${randomAudio.id}`,
      method: 'patch',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
      body: {
        title: randText(),
        description: randText(),
      },
    });

    assert.strictEqual(response.statusCode, 200, 'statusCode is 200');

    const JSONBody = JSON.parse(response.body);

    assertAudio(JSONBody);

    assert.equal(JSONBody.id, randomAudio.id);
    assert.notEqual(JSONBody.title, randomAudio.title);
    assert.notEqual(JSONBody.description, randomAudio.description);
  });
});

describe('DELETE /audios/:id', () => {
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
      url: `/audios/${randNumber()}`,
      method: 'delete',
    });

    assert.strictEqual(response.statusCode, 401, 'statusCode is 401');
  });

  test('return status 404 if audio does not exists', async () => {
    const response = await server.inject({
      url: `/audios/${randNumber()}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    assert.strictEqual(response.statusCode, 404, 'statusCode is 404');
  });

  test('return status 403 if user does not have permission to delete the audio', async () => {
    const otherUser = await testUtils.createRandomUser();
    const otherSession = await testUtils.createSession({
      username: otherUser.data.username,
      password: otherUser.input.password,
    });

    const audio = await testUtils.createRandomAudio(otherSession);

    const response = await server.inject({
      url: `/audios/${audio.id}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    assert.strictEqual(response.statusCode, 403, 'statusCode is 403');
  });

  test('return status 204', async () => {
    const randomAudio = await testUtils.createRandomAudio(session);

    const response = await server.inject({
      url: `/audios/${randomAudio.id}`,
      method: 'delete',
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });

    assert.strictEqual(response.statusCode, 204, 'statusCode is 204');
  });
});

describe('GET /users/:id/audios', () => {
  test('return status 200 and an empty array if user does not exists', async () => {
    const response = await server.inject({
      url: `/users/${randNumber()}/audios`,
      method: 'get',
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 200, 'statusCode is 200');
    assert.ok(Array.isArray(JSONBody));
    assert.strictEqual(JSONBody.length, 0);
  });

  test('return status 200 and an array with user Audios', async () => {
    const user = await testUtils.createRandomUser();
    const session = await testUtils.createSession({
      username: user.data.username,
      password: user.input.password,
    });
    const audio = await testUtils.createRandomAudio(session);

    const response = await server.inject({
      url: `/users/${user.data.id}/audios`,
      method: 'get',
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 200, 'statusCode is 200');
    assert.ok(Array.isArray(JSONBody));
    assert.strictEqual(JSONBody.length, 1);
    assert.deepStrictEqual(JSONBody[0], audio);
  });
});

describe('GET /audios/:id', () => {
  test('return status 404 if audio does not exists', async () => {
    const response = await server.inject({
      url: `/audios/${randNumber()}`,
      method: 'get',
    });

    assert.strictEqual(response.statusCode, 404, 'statusCode is 404');
  });

  test('return status 200', async () => {
    const user = await testUtils.createRandomUser();

    const session = await testUtils.createSession({
      username: user.data.username,
      password: user.input.password,
    });

    const randomAudio = await testUtils.createRandomAudio(session);

    const response = await server.inject({
      url: `/audios/${randomAudio.id}`,
      method: 'get',
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 200, 'statusCode is 200');

    assertAudio(JSONBody);
  });
});

describe('POST /audios', () => {
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
      url: '/audios',
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

  describe('return status 400 if body is not correct', () => {
    test('return status 400 if a required field is missing', async () => {
      const response = await server.inject({
        url: '/audios',
        method: 'post',
        headers: {
          authorization: `Bearer ${session.token}`,
        },
        body: {},
      });

      assert.strictEqual(response.statusCode, 400, 'statusCode is 400');
    });

    test('return status 400 if a fileId does not exists', async () => {
      const response = await server.inject({
        url: '/audios',
        method: 'post',
        headers: {
          authorization: `Bearer ${session.token}`,
        },
        body: {
          title: randText(),
          description: randText(),
          fileId: randText(),
        },
      });

      assert.strictEqual(response.statusCode, 400, 'statusCode is 400');
    });

    test('return status 400 if a fileId does not exists', async () => {
      const response = await server.inject({
        url: '/audios',
        method: 'post',
        headers: {
          authorization: `Bearer ${session.token}`,
        },
        body: {
          title: randText(),
          description: randText(),
          fileId: randNumber(),
        },
      });

      assert.strictEqual(response.statusCode, 400, 'statusCode is 400');
    });
  });

  test('return status 201', async () => {
    const file = await testUtils.createRandomAudioFile(session);

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
    assert.strictEqual(response.statusCode, 201, 'statusCode is 201');

    assertAudio(JSONBody);
  });
});
