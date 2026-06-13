import type { Folder, FileItem } from "@windows-explorer/contracts";
import type { FolderRecord } from "../domain/folder.ts";
import type { FileRecord } from "../domain/file.ts";

export const toFolderDto = (r: FolderRecord): Folder => ({
  id: r.id,
  parentId: r.parentId,
  name: r.name,
  depth: r.depth,
  subfolderCount: r.subfolderCount,
  fileCount: r.fileCount,
  hasChildren: r.subfolderCount > 0,
  updatedAt: r.updatedAt.toISOString(),
});

export const toFileDto = (r: FileRecord): FileItem => ({
  id: r.id,
  folderId: r.folderId,
  name: r.name,
  extension: r.extension,
  sizeBytes: r.sizeBytes,
  updatedAt: r.updatedAt.toISOString(),
});
