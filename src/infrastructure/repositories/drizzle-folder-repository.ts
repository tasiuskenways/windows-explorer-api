import { and, eq, gt, inArray, isNull, or, sql as raw, asc } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import { folders } from "../db/schema.ts";
import type { FolderRepository } from "../../application/ports/folder-repository.ts";
import type { PageQuery, Keyset } from "../../application/ports/pagination.ts";
import { folderRowToRecord, folderExecRowToRecord } from "./row-mappers.ts";

const after = (k: Keyset | null) =>
  k ? or(gt(folders.name, k.name), and(eq(folders.name, k.name), gt(folders.id, k.id))) : undefined;

const paginate = (rows: (typeof folders.$inferSelect)[], limit: number) => ({
  items: rows.slice(0, limit).map(folderRowToRecord),
  hasMore: rows.length > limit,
});

export const createFolderRepository = (db: Db): FolderRepository => ({
  async findRoots(q: PageQuery) {
    const rows = await db.select().from(folders)
      .where(and(isNull(folders.parentId), after(q.after)))
      .orderBy(asc(folders.name), asc(folders.id))
      .limit(q.limit + 1);
    return paginate(rows, q.limit);
  },

  async findChildren(parentId, q) {
    const rows = await db.select().from(folders)
      .where(and(eq(folders.parentId, parentId), after(q.after)))
      .orderBy(asc(folders.name), asc(folders.id))
      .limit(q.limit + 1);
    return paginate(rows, q.limit);
  },

  async findById(id) {
    const [row] = await db.select().from(folders).where(eq(folders.id, id)).limit(1);
    return row ? folderRowToRecord(row) : null;
  },

  async findManyByIds(ids) {
    if (ids.length === 0) return [];
    const rows = await db.select().from(folders).where(inArray(folders.id, ids));
    return rows.map(folderRowToRecord);
  },

  async findAncestors(id) {
    const rows = (await db.execute(raw`
      SELECT a.* FROM folders self
      JOIN folders a ON a.path @> self.path
      WHERE self.id = ${id}
      ORDER BY nlevel(a.path) ASC
    `)) as unknown as Record<string, unknown>[];
    return rows.map(folderExecRowToRecord);
  },

  async findSubtree(rootId, maxNodes) {
    const rows = (rootId
      ? await db.execute(raw`
          SELECT d.* FROM folders r JOIN folders d ON d.path <@ r.path
          WHERE r.id = ${rootId} ORDER BY d.path LIMIT ${maxNodes}`)
      : await db.execute(raw`SELECT * FROM folders ORDER BY path LIMIT ${maxNodes}`)) as unknown as Record<string, unknown>[];
    return rows.map(folderExecRowToRecord);
  },
});
