import { test, expect } from "bun:test";
import { folders, files } from "./schema.ts";
import { getTableConfig } from "drizzle-orm/pg-core";

test("folders table exposes the expected columns", () => {
  const cols = getTableConfig(folders).columns.map((c) => c.name).sort();
  expect(cols).toEqual(
    ["created_at", "depth", "file_count", "id", "name", "parent_id", "path", "subfolder_count", "updated_at"].sort(),
  );
});

test("files table references folders", () => {
  const cols = getTableConfig(files).columns.map((c) => c.name);
  expect(cols).toContain("folder_id");
});
