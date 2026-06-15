import { uuidv7 } from "uuidv7";
import type { Folder } from "@windows-explorer/contracts";
import { NotFoundError, ValidationError } from "../../domain/errors.ts";
import { nextWindowsName, requireNonEmptyName } from "../../domain/windows-names.ts";
import { toFolderDto } from "../mappers.ts";
import type { FolderRepository, NamedItem } from "../ports/folder-repository.ts";

const isDuplicate = (siblings: NamedItem[], name: string, selfId?: string) =>
  siblings.some((s) => s.id !== selfId && s.name.toLocaleLowerCase() === name.toLocaleLowerCase());

export const createFolder =
  (repo: FolderRepository, newId: () => string = uuidv7) =>
  async (parentId: string, requestedName?: string): Promise<Folder> => {
    const parent = await repo.findById(parentId);
    if (!parent) throw new NotFoundError(`folder ${parentId} not found`);

    const siblings = await repo.findNamesByParent(parentId);
    const name = requestedName
      ? requireNonEmptyName(requestedName)
      : nextWindowsName("New folder", siblings.map((s) => s.name));
    if (isDuplicate(siblings, name)) throw new ValidationError(`"${name}" already exists`);

    return toFolderDto(await repo.createChild({ id: newId(), parent, name }));
  };

export const renameFolder =
  (repo: FolderRepository) =>
  async (id: string, requestedName: string): Promise<Folder> => {
    const folder = await repo.findById(id);
    if (!folder) throw new NotFoundError(`folder ${id} not found`);

    const name = requireNonEmptyName(requestedName);
    const siblings = await repo.findNamesByParent(folder.parentId);
    if (isDuplicate(siblings, name, id)) throw new ValidationError(`"${name}" already exists`);

    const renamed = await repo.rename(id, name);
    if (!renamed) throw new NotFoundError(`folder ${id} not found`);
    return toFolderDto(renamed);
  };
