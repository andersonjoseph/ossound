import { db } from '../../db';
import { BadRequest, Forbidden, NotFound } from '../../plugins/errors/errors';
import { Audio, audiosTable, NewAudio } from '../tables/audios';
import { and, eq, gt } from 'drizzle-orm';
import fileService from '../../files/services';
import { assignDefined } from '../../utils';

type PaginationOptions = {
  after?: number;
  count?: number;
};

const defaultPaginationOptions: PaginationOptions = {
  after: 0,
  count: 20,
};

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

async function getByUser(
  userId: number,
  paginationInput: PaginationOptions,
): Promise<Audio[]> {
  const paginationOptions = assignDefined(
    defaultPaginationOptions,
    paginationInput,
  ) as Required<PaginationOptions>;

  const audios = await db
    .select()
    .from(audiosTable)
    .limit(paginationOptions.count)
    .where(
      and(
        eq(audiosTable.userId, userId),
        gt(audiosTable.id, paginationOptions.after),
      ),
    );

  return audios;
}

async function remove(audio: Audio): Promise<void> {
  const file = await fileService.getByColumn('id', audio.fileId);

  await db.delete(audiosTable).where(eq(audiosTable.id, audio.id));
  await fileService.remove(file);
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
  getByUser,
  remove,
  update,
};
