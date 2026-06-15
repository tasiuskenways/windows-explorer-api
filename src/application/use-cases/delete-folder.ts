import { NotFoundError } from "../../domain/errors.ts";
import type { FolderRepository } from "../ports/folder-repository.ts";

export const deleteFolder =
  (repo: FolderRepository) =>
  async (id: string): Promise<void> => {
    const folder = await repo.findById(id);
    if (!folder) throw new NotFoundError(`folder ${id} not found`);

    const deleted = await repo.delete(id);
    if (!deleted) throw new NotFoundError(`folder ${id} not found`);
  };
