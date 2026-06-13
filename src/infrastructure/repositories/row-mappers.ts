import type { FolderRecord } from "../../domain/folder.ts";
import type { FileRecord } from "../../domain/file.ts";
import type { folders, files } from "../db/schema.ts";

type FolderRow = typeof folders.$inferSelect;
type FileRow = typeof files.$inferSelect;

export const folderRowToRecord = (r: FolderRow): FolderRecord => ({ ...r });
export const fileRowToRecord = (r: FileRow): FileRecord => ({ ...r });

// db.execute returns snake_case rows untyped; map them explicitly.
export const folderExecRowToRecord = (r: Record<string, unknown>): FolderRecord => ({
  id: r.id as string,
  parentId: (r.parent_id as string | null) ?? null,
  name: r.name as string,
  path: r.path as string,
  depth: r.depth as number,
  subfolderCount: r.subfolder_count as number,
  fileCount: r.file_count as number,
  createdAt: new Date(r.created_at as string),
  updatedAt: new Date(r.updated_at as string),
});
