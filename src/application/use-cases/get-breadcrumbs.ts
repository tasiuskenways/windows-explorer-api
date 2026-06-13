import type { FolderRepository } from "../ports/folder-repository.ts";
import type { Breadcrumb } from "@windows-explorer/contracts";
import { NotFoundError } from "../../domain/errors.ts";

export const getBreadcrumbs = (repo: FolderRepository) => async (id: string): Promise<Breadcrumb[]> => {
  const chain = await repo.findAncestors(id);
  if (chain.length === 0) throw new NotFoundError(`folder ${id} not found`);
  return chain.map((f) => ({ id: f.id, name: f.name }));
};
