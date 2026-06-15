import { NotFoundError } from "../../domain/errors.ts";
import type { FileRepository } from "../ports/file-repository.ts";

export const deleteFile =
  (repo: FileRepository) =>
  async (id: string): Promise<void> => {
    const file = await repo.findById(id);
    if (!file) throw new NotFoundError(`file ${id} not found`);

    const deleted = await repo.delete(id);
    if (!deleted) throw new NotFoundError(`file ${id} not found`);
  };
