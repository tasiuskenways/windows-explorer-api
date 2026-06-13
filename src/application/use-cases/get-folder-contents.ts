import type { FolderRepository } from "../ports/folder-repository.ts";
import type { FileRepository } from "../ports/file-repository.ts";
import type { FolderContents } from "@windows-explorer/contracts";
import { NotFoundError } from "../../domain/errors.ts";
import { toFolderDto, toFileDto } from "../mappers.ts";
import { encodeNextCursor } from "../pagination-cursor.ts";

export const getFolderContents =
  (folders: FolderRepository, files: FileRepository) =>
  async (id: string, limit: number): Promise<FolderContents> => {
    const folder = await folders.findById(id);
    if (!folder) throw new NotFoundError(`folder ${id} not found`);

    const [childPage, filePage] = await Promise.all([
      folders.findChildren(id, { limit, after: null }),
      files.findByFolder(id, { limit, after: null }),
    ]);

    return {
      folder: toFolderDto(folder),
      folders: {
        data: childPage.items.map(toFolderDto),
        pageInfo: { hasMore: childPage.hasMore, nextCursor: encodeNextCursor(childPage) },
      },
      files: {
        data: filePage.items.map(toFileDto),
        pageInfo: { hasMore: filePage.hasMore, nextCursor: encodeNextCursor(filePage) },
      },
    };
  };
