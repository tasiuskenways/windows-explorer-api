import { and, eq, gt, or, asc } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import { files } from "../db/schema.ts";
import type { FileRepository } from "../../application/ports/file-repository.ts";
import type { Keyset, PageQuery } from "../../application/ports/pagination.ts";
import { fileRowToRecord } from "./row-mappers.ts";

const after = (k: Keyset | null) =>
  k ? or(gt(files.name, k.name), and(eq(files.name, k.name), gt(files.id, k.id))) : undefined;

export const createFileRepository = (db: Db): FileRepository => ({
  async findByFolder(folderId, q: PageQuery) {
    const rows = await db.select().from(files)
      .where(and(eq(files.folderId, folderId), after(q.after)))
      .orderBy(asc(files.name), asc(files.id))
      .limit(q.limit + 1);
    return { items: rows.slice(0, q.limit).map(fileRowToRecord), hasMore: rows.length > q.limit };
  },
});
