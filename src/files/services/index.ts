import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { NotFound } from '../../plugins/errors/errors';
import { File, filesTable, NewFile } from '../tables/files';

type GetOptions = {
  throwIfNotFound?: boolean;
};

const defaultOptions: GetOptions = {
  throwIfNotFound: true,
};

async function create(data: NewFile): Promise<File> {
  const [newFile] = await db.insert(filesTable).values(data).returning();

  return newFile;
}

async function getByColumn(
  column: keyof File,
  value: string | number,
  options: GetOptions = defaultOptions,
): Promise<File> {
  const [file] = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable[column], value));

  if (!file && options.throwIfNotFound) {
    throw new NotFound();
  }

  return file;
}

async function remove(id: number): Promise<void> {
  await db.delete(filesTable).where(eq(filesTable.id, id));
}

export default {
  create,
  getByColumn,
  remove,
};
