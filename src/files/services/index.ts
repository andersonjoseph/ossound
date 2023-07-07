import { eq } from 'drizzle-orm';
import { createReadStream, createWriteStream } from 'fs';
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

const uploadDirectory = path.join(__dirname, '..', '..', '..', 'uploads');

async function create(data: NewFile, fileStream: Readable): Promise<File> {
  const writeStream = createWriteStream(
    path.join(uploadDirectory, data.fileName),
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

function getFileStream(fileName: string): Readable {
  return createReadStream(path.join(uploadDirectory, fileName));
}

async function remove(file: File): Promise<void> {
  await db.delete(filesTable).where(eq(filesTable.id, file.id));
  await fs.rm(path.join(uploadDirectory, file.fileName), { force: true });
}

export default {
  create,
  getByColumn,
  remove,
  getFileStream,
};
