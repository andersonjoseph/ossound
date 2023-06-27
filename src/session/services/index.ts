import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { SerializedUser, usersTable } from '../../user/tables/users';
import bcrypt from 'bcrypt';
import { NotFound, UnauthorizedError } from '../../plugins/errors/errors';
import { serializeUser } from '../../user/utils';
import { randomBytes } from 'crypto';
import { PasswordReset } from '../types';

async function create(data: {
  username: string;
  password: string;
}): Promise<SerializedUser> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, data.username));

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new UnauthorizedError();
  }

  return serializeUser(user);
}

async function createPasswordReset(data: {
  username: string;
  email: string;
}): Promise<PasswordReset> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.username, data.username),
        eq(usersTable.email, data.email),
      ),
    );

  if (!user) {
    throw new NotFound();
  }

  const newPasswordResetToken = randomBytes(16).toString('hex');
  await db
    .update(usersTable)
    .set({ passwordResetToken: newPasswordResetToken })
    .where(eq(usersTable.id, user.id));

  return {
    passwordResetToken: newPasswordResetToken,
    user: user,
  };
}

export default {
  create,
  createPasswordReset,
};
