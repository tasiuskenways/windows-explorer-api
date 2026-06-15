import { uuidv7 } from "uuidv7";
import type { FileItem } from "@windows-explorer/contracts";
import { NotFoundError, ValidationError } from "../../domain/errors.ts";
import { extensionFromName, nextWindowsName, requireNonEmptyName } from "../../domain/windows-names.ts";
import { toFileDto } from "../mappers.ts";
import type { FolderRepository } from "../ports/folder-repository.ts";
import type { FileRepository, NamedItem } from "../ports/file-repository.ts";

const isDuplicate = (siblings: NamedItem[], name: string, selfId?: string) =>
  siblings.some((s) => s.id !== selfId && s.name.toLocaleLowerCase() === name.toLocaleLowerCase());

export const createFile =
  (folders: FolderRepository, files: FileRepository, newId: () => string = uuidv7) =>
  async (folderId: string, requestedName?: string): Promise<FileItem> => {
    if (!(await folders.findById(folderId))) throw new NotFoundError(`folder ${folderId} not found`);

    const siblings = await files.findNamesByFolder(folderId);
    const name = requestedName
      ? requireNonEmptyName(requestedName)
      : nextWindowsName("New Text Document.txt", siblings.map((s) => s.name));
    if (isDuplicate(siblings, name)) throw new ValidationError(`"${name}" already exists`);

    return toFileDto(await files.create({ id: newId(), folderId, name, extension: extensionFromName(name) }));
  };

export const renameFile =
  (repo: FileRepository) =>
  async (id: string, requestedName: string): Promise<FileItem> => {
    const file = await repo.findById(id);
    if (!file) throw new NotFoundError(`file ${id} not found`);

    const name = requireNonEmptyName(requestedName);
    const siblings = await repo.findNamesByFolder(file.folderId);
    if (isDuplicate(siblings, name, id)) throw new ValidationError(`"${name}" already exists`);

    const renamed = await repo.rename(id, name, extensionFromName(name));
    if (!renamed) throw new NotFoundError(`file ${id} not found`);
    return toFileDto(renamed);
  };
