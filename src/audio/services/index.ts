import { db } from '../../db';
import { BadRequest, Forbidden, NotFound } from '../../plugins/errors/errors';
import { Audio, audiosTable, NewAudio } from '../tables/audios';
import { eq } from 'drizzle-orm';
import fileService from '../../files/services';

async function create(audioData: NewAudio): Promise<Audio> {
  const file = await fileService.getByColumn('id', audioData.fileId, {
    throwIfNotFound: false,
  });

  if (!file) {
    const notFoundErr = new BadRequest();
    notFoundErr.message = 'fileId does not exists';

    throw notFoundErr;
  }

  if (file.isUsed) {
    const forbiddenErr = new Forbidden();
    forbiddenErr.message = 'file is already used';

    throw forbiddenErr;
  }

  if (file.userId !== audioData.userId) {
    const forbiddenErr = new Forbidden();
    forbiddenErr.message =
      'you are not the owner of the file you are trying to attach';

    throw forbiddenErr;
  }

  const [newAudio] = await db.insert(audiosTable).values(audioData).returning();

  return newAudio;
}

type GetOptions = {
  throwIfNotFound?: boolean;
};

const defaultOptions: GetOptions = {
  throwIfNotFound: true,
};

async function getByColumn(
  column: keyof Audio,
  value: string | number,
  options: GetOptions = defaultOptions,
): Promise<Audio> {
  const [audio] = await db
    .select()
    .from(audiosTable)
    .where(eq(audiosTable[column], value));

  if (!audio && options.throwIfNotFound) {
    throw new NotFound();
  }

  return audio;
}

async function remove(id: number): Promise<void> {
  await db.delete(audiosTable).where(eq(audiosTable.id, id));
}

async function update(audio: Audio, data: Partial<NewAudio>): Promise<Audio> {
  if (!Object.keys(data).length) {
    return audio;
  }

  const [updatedAudio] = await db
    .update(audiosTable)
    .set(data)
    .where(eq(audiosTable.id, audio.id))
    .returning();

  return updatedAudio;
}

export default {
  create,
  getByColumn,
  remove,
  update,
};
