import assert from 'node:assert';
import { describe, test } from 'node:test';
import server from '../../src/server';
import {
  randEmail,
  randPassword,
  randFirstName,
  randNumber,
} from '@ngneat/falso';
import testUtils from '../utils';
import { SerializedUser } from '../../src/user/tables/users';

function testUserIsValid(
  body: Record<string, unknown>,
  data: SerializedUser,
): void {
  assert.ok('id' in body, 'id is defined');
  assert.strictEqual(typeof body.id, 'string', 'id is a string');

  assert.ok('username' in body, 'username is defined');
  assert.strictEqual(
    body.username,
    data.username,
    'body.username is equal to username sent',
  );

  assert.ok(!('password' in body), 'password is not defined');
  assert.ok(
    !('passwordResetToken' in body),
    'passwordResetToken is not defined',
  );
}

describe('PATCH /users/:id', () => {
  async function testInvalidUserUpdate(
    id: string,
    body: Record<string, unknown>,
  ): Promise<void> {
    const response = await server.inject({
      url: `/users/${id}`,
      method: 'patch',
      body,
    });

    assert.strictEqual(response.statusCode, 400);
  }

  test('return 404 if a user does not exists', async () => {
    const response = await server.inject({
      url: `/users/${randNumber()}`,
      method: 'patch',
      body: {
        email: randEmail(),
      },
    });

    assert.strictEqual(response.statusCode, 404);
  });

  describe('return 400 if the update body is not valid', () => {
    test('empty username', async () => {
      const user = await testUtils.createRandomUser();

      await testInvalidUserUpdate(user.data.id, {
        username: '',
      });
    });

    test('short username', async () => {
      const user = await testUtils.createRandomUser();

      await testInvalidUserUpdate(user.data.id, {
        username: 'a',
      });
    });

    test('empty email', async () => {
      const user = await testUtils.createRandomUser();

      await testInvalidUserUpdate(user.data.id, {
        email: '',
      });
    });
  });
});

describe('GET /users/:id', () => {
  test('return status 404 if a user does not exists', async () => {
    const response = await server.inject({
      url: `/users/${randNumber()}`,
      method: 'get',
    });

    assert.strictEqual(response.statusCode, 404);
  });

  test('return status 200 if a user exists', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: `/users/${user.data.id}`,
      method: 'get',
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 200, 'status is 200');

    testUserIsValid(JSONBody, user.data);
  });
});

describe('POST /users', () => {
  async function testInvalidUsernameCreation(
    body: Record<string, unknown>,
  ): Promise<void> {
    const response = await server.inject({
      url: '/users',
      method: 'post',
      body,
    });

    assert.strictEqual(response.statusCode, 400);
  }

  test('return status 400 if a required field is not in body', async () => {
    const response = await server.inject({
      url: '/users',
      method: 'post',
      body: {},
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 400, 'statusCode is 400');
    assert.deepStrictEqual(
      JSONBody,
      {
        message: 'Bad Request',
        errors: [
          {
            type: 'required',
            message: "The 'username' field is required.",
            field: 'username',
          },
          {
            type: 'required',
            message: "The 'email' field is required.",
            field: 'email',
          },
          {
            type: 'required',
            message: "The 'password' field is required.",
            field: 'password',
          },
        ],
      },
      'error is returned',
    );
  });

  describe('return status 400 if username is not valid', () => {
    test('statusCode is 400 when a user is empty', async () => {
      await testInvalidUsernameCreation({
        username: '',
        email: randEmail(),
        password: randPassword(),
      });
    });

    test('statusCode is 400 when a username is less than 2 characters', async () => {
      await testInvalidUsernameCreation({
        username: 'x',
        email: randEmail(),
        password: randPassword(),
      });
    });

    test('statusCode is 400 when a username contains spaces', async () => {
      await testInvalidUsernameCreation({
        username: 'hello world',
        email: randEmail(),
        password: randPassword(),
      });
    });
  });

  test('return status 409 if username already exists', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: '/users',
      method: 'post',
      body: {
        email: randEmail(),
        password: randPassword(),
        username: user.data.username,
      },
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 409, 'statusCode is 409');
    assert.strictEqual(
      JSONBody.message,
      'an user with this username already exists',
    );
  });

  test('return status 409 if username already exists', async () => {
    const user = await testUtils.createRandomUser();

    const response = await server.inject({
      url: '/users',
      method: 'post',
      body: {
        email: user.data.email,
        password: randPassword(),
        username: randFirstName({ withAccents: false }).toLowerCase(),
      },
    });

    const JSONBody = JSON.parse(response.body);

    assert.strictEqual(response.statusCode, 409, 'statusCode is 409');
    assert.strictEqual(
      JSONBody.message,
      'an user with this email already exists',
    );
  });

  test('return status 201 if a use is created succesfully', async () => {
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

    assert.strictEqual(response.statusCode, 201, 'statusCode is 201');

    testUserIsValid(JSONBody, { id: 'a', username, password, email });
  });
});
