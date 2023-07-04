import { InferModel, sql } from 'drizzle-orm';
import {
  integer,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { filesTable } from '../../files/tables/files';
import { usersTable } from '../../user/tables/users';

export const audiosTable = pgTable(
  'audios',
  {
    id: serial('id').primaryKey().notNull(),
    title: varchar('title', { length: 32 }).notNull(),
    description: varchar('description', { length: 264 }).default(sql`NULL`),
    playCount: integer('play_count').default(0),
    userId: integer('user_id')
      .references(() => usersTable.id, { onDelete: 'cascade' })
      .notNull(),
    fileId: integer('file_id')
      .references(() => filesTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (audiosTable) => ({
    fileIdIdx: uniqueIndex('file_id_idx').on(audiosTable.fileId),
  }),
);

export type Audio = InferModel<typeof audiosTable>;
export type NewAudio = InferModel<typeof audiosTable, 'insert'>;

export type SerializedAudio = Omit<InferModel<typeof audiosTable>, 'id'> & {
  id: string;
};
