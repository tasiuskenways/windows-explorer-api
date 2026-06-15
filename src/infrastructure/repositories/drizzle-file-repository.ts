import { and, eq, gt, or, asc } from "drizzle-orm";
import type { Db } from "../db/client.ts";
import { files, folders } from "../db/schema.ts";
import type { FileRepository } from "../../application/ports/file-repository.ts";
import type { Keyset, PageQuery } from "../../application/ports/pagination.ts";
import { fileRowToRecord } from "./row-mappers.ts";
import { sql as raw } from "drizzle-orm";

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

  async findById(id) {
    const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    return row ? fileRowToRecord(row) : null;
  },

  async findNamesByFolder(folderId) {
    return db.select({ id: files.id, name: files.name }).from(files).where(eq(files.folderId, folderId));
  },

  async create({ id, folderId, name, extension }) {
    const now = new Date();
    const [row] = await db.insert(files).values({
      id,
      folderId,
      name,
      extension,
      sizeBytes: 0,
      createdAt: now,
      updatedAt: now,
    }).returning();
    await db.update(folders)
      .set({ fileCount: raw`${folders.fileCount} + 1`, updatedAt: now })
      .where(eq(folders.id, folderId));
    return fileRowToRecord(row!);
  },

  async rename(id, name, extension) {
    const [row] = await db.update(files)
      .set({ name, extension, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return row ? fileRowToRecord(row) : null;
  },

  async delete(id) {
    const [file] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    if (!file) return false;

    const now = new Date();
    await db.delete(files).where(eq(files.id, id));
    await db.update(folders)
      .set({ fileCount: raw`GREATEST(${folders.fileCount} - 1, 0)`, updatedAt: now })
      .where(eq(folders.id, file.folderId));
    return true;
  },
});
