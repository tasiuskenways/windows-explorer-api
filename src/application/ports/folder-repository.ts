import type { FolderRecord } from "../../domain/folder.ts";
import type { PageQuery, RepoPage } from "./pagination.ts";

export interface FolderRepository {
  findRoots(q: PageQuery): Promise<RepoPage<FolderRecord>>;
  findChildren(parentId: string, q: PageQuery): Promise<RepoPage<FolderRecord>>;
  findById(id: string): Promise<FolderRecord | null>;
  findManyByIds(ids: string[]): Promise<FolderRecord[]>;
  findAncestors(id: string): Promise<FolderRecord[]>;
  findSubtree(rootId: string | null, maxNodes: number): Promise<FolderRecord[]>;
}
