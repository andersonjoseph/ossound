import { InferModel } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from '../../user/tables/users';

export const filesTable = pgTable(
  'files',
  {
    id: serial('id').primaryKey().notNull(),
    fileName: varchar('file_name', { length: 264 }).notNull(),
    mime: varchar('mime', { length: 32 }).notNull(),
    isUsed: boolean('is_used').default(false),
    userId: integer('user_id')
      .references(() => usersTable.id)
      .notNull(),
  },
  (filesTable) => ({
    fileNameIdx: uniqueIndex('file_name_idx').on(filesTable.fileName),
  }),
);

export type File = InferModel<typeof filesTable>;
export type NewFile = InferModel<typeof filesTable, 'insert'>;

export type SerializedFile = Omit<File, 'userId' | 'id'> & {
  userId: string;
  id: string;
};
