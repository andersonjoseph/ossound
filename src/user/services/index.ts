import { db } from '../../db';
import { NewUser, User, usersTable } from '../tables/users';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Conflict, NotFound } from '../../plugins/errors/errors';

type GetOptions = {
  throwIfNotFound?: boolean;
};

const defaultOptions: GetOptions = {
  throwIfNotFound: true,
};

async function throwIfUserExists(userData: NewUser): Promise<void> {
  let existingUser = await getByColumn('email', userData.email, {
    throwIfNotFound: false,
  });

  if (existingUser) {
    const conflictError = new Conflict();
    conflictError.message = 'an user with this email already exists';

    throw conflictError;
  }

  existingUser = await getByColumn('username', userData.username, {
    throwIfNotFound: false,
  });

  if (existingUser) {
    const conflictError = new Conflict();
    conflictError.message = 'an user with this username already exists';

    throw conflictError;
  }
}

async function create(userData: NewUser): Promise<User> {
  await throwIfUserExists(userData);

  userData.password = await bcrypt.hash(userData.password, 10);

  const [newUser] = await db.insert(usersTable).values(userData).returning();

  return newUser;
}

async function getByColumn(
  column: keyof User,
  value: string | number,
  options: GetOptions = defaultOptions,
): Promise<User> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable[column], value));

  if (!user && options.throwIfNotFound) {
    throw new NotFound();
  }

  return user;
}

async function update(
  user: User,
  data: Partial<{ username: string; email: string }>,
): Promise<User> {
  if (!Object.keys(data).length) {
    return user;
  }
  await throwIfUserExists(user);

  const [updatedUser] = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, user.id))
    .returning();

  return updatedUser;
}

export default {
  create,
  getByColumn,
  update,
};
