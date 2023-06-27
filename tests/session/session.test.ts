import { randEmail, randPassword, randUserName } from '@ngneat/falso';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import server from '../../src/server';
import testUtils from '../utils';

function testUnauthorizedError(
  statusCode: number,
  body: Record<string, unknown>,
): void {
  assert.strictEqual(statusCode, 401, 'statusCode is 401');
  assert.deepStrictEqual(body, {
    statusCode: 401,
    code: 'FST_UNAUTHORIZED',
    error: 'Unauthorized',
    message: 'username or password incorrect.',
  });
}

describe('POST /session', () => {
  test('return status 401 if user is incorrect', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: '/session',
      method: 'post',
      body: {
        username: randUserName(),
        password: user.input.password,
      },
    });

    const JSONBody = JSON.parse(response.body);

    testUnauthorizedError(response.statusCode, JSONBody);
  });

  test('return status 401 if password is incorrect', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: '/session',
      method: 'post',
      body: {
        username: user.input.username,
        password: randPassword(),
      },
    });

    const JSONBody = JSON.parse(response.body);

    testUnauthorizedError(response.statusCode, JSONBody);
  });

  test('return status 401 if user does not exist', async () => {
    const response = await server.inject({
      url: '/session',
      method: 'post',
      body: {
        username: randUserName(),
        password: randPassword(),
      },
    });

    const JSONBody = JSON.parse(response.body);

    testUnauthorizedError(response.statusCode, JSONBody);
  });

  test('return 201 if credentials are correct', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: '/session',
      method: 'post',
      body: {
        username: user.input.username,
        password: user.input.password,
      },
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 201, 'statusCode is 201');
    assert.ok('token' in JSONBody);
    assert.equal(typeof JSONBody.token, 'string');
    assert.notEqual(JSONBody.token.length, 0);
  });
});

describe('POST /session/password-reset', () => {
  test('return 400 if a required body property is not present', async () => {
    const response = await server.inject({
      url: '/session/password-reset',
      method: 'post',
      body: {},
    });

    assert.strictEqual(response.statusCode, 400, 'statusCode is 404');
  });

  test('return 404 if user or email does not exists', async () => {
    const response = await server.inject({
      url: '/session/password-reset',
      method: 'post',
      body: {
        username: randUserName(),
        email: randEmail(),
      },
    });

    assert.strictEqual(response.statusCode, 404, 'statusCode is 404');
  });

  test('return 202 if a password reset request is succesfully generated', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: '/session/password-reset',
      method: 'post',
      body: {
        username: user.data.username,
        email: user.data.email,
      },
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 202, 'statusCode is 202');

    assert.strictEqual(
      JSONBody.user.username,
      user.data.username,
      'username is the same',
    );
    assert.strictEqual(
      JSONBody.user.email,
      user.data.email,
      'email is the same',
    );

    assert.notEqual(
      JSONBody.passwordResetToken.length,
      0,
      'password token is present',
    );
  });
});
