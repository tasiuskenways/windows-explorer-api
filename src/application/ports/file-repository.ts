import type { FileRecord } from "../../domain/file.ts";
import type { PageQuery, RepoPage } from "./pagination.ts";

export interface NamedItem {
  id: string;
  name: string;
}

export interface FileRepository {
  findByFolder(folderId: string, q: PageQuery): Promise<RepoPage<FileRecord>>;
  findById(id: string): Promise<FileRecord | null>;
  findNamesByFolder(folderId: string): Promise<NamedItem[]>;
  create(input: { id: string; folderId: string; name: string; extension: string | null }): Promise<FileRecord>;
  rename(id: string, name: string, extension: string | null): Promise<FileRecord | null>;
}
