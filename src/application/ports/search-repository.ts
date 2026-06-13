import type { SearchHitRecord } from "../../domain/search.ts";
import type { PageQuery, RepoPage } from "./pagination.ts";

export interface SearchRepository {
  search(term: string, type: "folder" | "file" | "all", q: PageQuery): Promise<RepoPage<SearchHitRecord>>;
}
