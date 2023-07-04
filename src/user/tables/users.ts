import { InferModel, sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { Optional } from '../../types';

export const usersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey().notNull(),
    username: varchar('username', { length: 32 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    password: text('password').notNull(),
    passwordResetToken: text('passwordResetToken').default(sql`NULL`),
  },
  (usersTable) => ({
    usernameIdx: uniqueIndex('username_idx').on(usersTable.username),
    emailIdx: uniqueIndex('email_idx').on(usersTable.email),
  }),
);

export type User = InferModel<typeof usersTable>;
export type SerializedUser = Omit<
  Optional<User, 'password' | 'passwordResetToken'>,
  'id'
> & { id: string };
export type AuthenticatedUser = Omit<
  Optional<User, 'password' | 'passwordResetToken'>,
  'id'
> & { id: string };
export type NewUser = InferModel<typeof usersTable, 'insert'>;
