import { sql as raw } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import type { SearchRepository } from "../../application/ports/search-repository.ts";
import type { PageQuery } from "../../application/ports/pagination.ts";
import type { SearchHitRecord } from "../../domain/search.ts";

export const createSearchRepository = (db: Db): SearchRepository => ({
  async search(term, type, q: PageQuery) {
    const escaped = term.toLowerCase().replace(/[\\%_]/g, "\\$&");
    const like = `%${escaped}%`;
    const wantFolders = type === "folder" || type === "all";
    const wantFiles = type === "file" || type === "all";

    const parts = [];
    if (wantFolders) parts.push(raw`
      SELECT 'folder'::text AS type, f.id, f.name, f.path
      FROM folders f WHERE lower(f.name) LIKE ${like} ESCAPE '\\'`);
    if (wantFiles) parts.push(raw`
      SELECT 'file'::text AS type, fi.id, fi.name, parent.path
      FROM files fi JOIN folders parent ON parent.id = fi.folder_id
      WHERE lower(fi.name) LIKE ${like} ESCAPE '\\'`);

    const union = parts.length === 2 ? raw`${parts[0]} UNION ALL ${parts[1]}` : parts[0]!;
    const afterClause = q.after
      ? raw`WHERE (hits.name > ${q.after.name}) OR (hits.name = ${q.after.name} AND hits.id > ${q.after.id})`
      : raw``;
    const rows = (await db.execute(raw`
      SELECT * FROM (${union}) hits ${afterClause} ORDER BY name ASC, id ASC LIMIT ${q.limit + 1}
    `)) as unknown as Record<string, unknown>[];

    const hasMore = rows.length > q.limit;
    const items: SearchHitRecord[] = rows.slice(0, q.limit).map((r) => ({
      type: r.type as "folder" | "file",
      id: r.id as string,
      name: r.name as string,
      path: r.path as string,
    }));
    return { items, hasMore };
  },
});
