import { eq } from 'drizzle-orm';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { db } from '../../db';
import { NotFound } from '../../plugins/errors/errors';
import { File, filesTable, NewFile } from '../tables/files';
import path from 'path';

type GetOptions = {
  throwIfNotFound?: boolean;
};

const defaultOptions: GetOptions = {
  throwIfNotFound: true,
};

async function create(data: NewFile, fileStream: Readable): Promise<File> {
  const writeStream = createWriteStream(
    path.join(__dirname, '..', '..', '..', 'uploads', `${data.fileName}`),
  );

  await pipeline(fileStream, writeStream);

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

async function remove(file: File): Promise<void> {
  await db.delete(filesTable).where(eq(filesTable.id, file.id));
  await fs.rm(
    path.join(__dirname, '..', '..', '..', 'uploads', `${file.fileName}`),
    { force: true },
  );
}

export default {
  create,
  getByColumn,
  remove,
};
