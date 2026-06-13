import type { SearchRepository } from "../ports/search-repository.ts";
import type { FolderRepository } from "../ports/folder-repository.ts";
import type { PageQuery } from "../ports/pagination.ts";
import type { SearchHit } from "@windows-explorer/contracts";
import { ancestorIdsFromPath } from "../../domain/ltree-path.ts";

export const search =
  (searchRepo: SearchRepository, folders: FolderRepository) =>
  async (term: string, type: "folder" | "file" | "all", q: PageQuery) => {
    const page = await searchRepo.search(term, type, q);

    // A folder hit's own path includes itself; a file hit's path is its folder's path.
    const ancestorIdsByHit = page.items.map((h) => ancestorIdsFromPath(h.path, h.type === "file"));
    const allIds = [...new Set(ancestorIdsByHit.flat())];
    const byId = new Map((await folders.findManyByIds(allIds)).map((f) => [f.id, f.name]));

    const items: SearchHit[] = page.items.map((h, i) => ({
      type: h.type,
      id: h.id,
      name: h.name,
      ancestors: ancestorIdsByHit[i]!.map((id) => ({ id, name: byId.get(id) ?? "" })),
    }));
    return { items, hasMore: page.hasMore };
  };
