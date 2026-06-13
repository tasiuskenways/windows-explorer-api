import type { FileRecord } from "../../domain/file.ts";
import type { PageQuery, RepoPage } from "./pagination.ts";

export interface FileRepository {
  findByFolder(folderId: string, q: PageQuery): Promise<RepoPage<FileRecord>>;
}
