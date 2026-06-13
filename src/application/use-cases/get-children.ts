import type { FolderRepository } from "../ports/folder-repository.ts";
import type { PageQuery } from "../ports/pagination.ts";
import { NotFoundError } from "../../domain/errors.ts";
import { toFolderDto } from "../mappers.ts";

export const getChildren = (repo: FolderRepository) => async (parentId: string, q: PageQuery) => {
  if (!(await repo.findById(parentId))) throw new NotFoundError(`folder ${parentId} not found`);
  const page = await repo.findChildren(parentId, q);
  return { items: page.items.map(toFolderDto), hasMore: page.hasMore };
};
