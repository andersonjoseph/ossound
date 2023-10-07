import {pgTable, serial, varchar} from "drizzle-orm/pg-core";

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', {length: 32}).unique().notNull(),
  email: varchar('email').unique().notNull(),
  password: varchar('password').notNull(),
});

export type UserDbResult = typeof usersTable.$inferSelect;
