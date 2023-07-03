import { randEmail, randFirstName, randPassword } from '@ngneat/falso';
import userService from '../src/user/services';
import { SerializedUser } from '../src/user/tables/users';
import server from '../src/server';

async function createRandomUser(): Promise<{
  input: Parameters<typeof userService['create']>[0];
  data: SerializedUser;
}> {
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

export default {
  createRandomUser,
  createSession,
};
