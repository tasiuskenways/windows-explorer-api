import type { FolderRepository } from "../ports/folder-repository.ts";
import type { PageQuery } from "../ports/pagination.ts";
import { toFolderDto } from "../mappers.ts";

export const getRootFolders = (repo: FolderRepository) => async (q: PageQuery) => {
  const page = await repo.findRoots(q);
  return { items: page.items.map(toFolderDto), hasMore: page.hasMore };
};
