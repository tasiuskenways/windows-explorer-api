import { pgTable, uuid, text, integer, bigint, timestamp, index } from "drizzle-orm/pg-core";
import { ltree } from "./ltree-column.ts";

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").primaryKey(),
    parentId: uuid("parent_id").references((): any => folders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    path: ltree("path").notNull(),
    depth: integer("depth").notNull(),
    subfolderCount: integer("subfolder_count").notNull().default(0),
    fileCount: integer("file_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("folders_parent_name_id_idx").on(t.parentId, t.name, t.id),
  ],
);

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey(),
    folderId: uuid("folder_id").notNull().references(() => folders.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    extension: text("extension"),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("files_folder_name_id_idx").on(t.folderId, t.name, t.id),
  ],
);
