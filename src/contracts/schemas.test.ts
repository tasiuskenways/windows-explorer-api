import { test, expect } from "bun:test";
import { Value } from "@sinclair/typebox/value";
import { FolderSchema, PaginatedSchema, FileSchema } from "./schemas.ts";

test("FolderSchema accepts a valid folder and rejects a missing field", () => {
  const ok = { id: crypto.randomUUID(), parentId: null, name: "Docs", depth: 0,
    subfolderCount: 2, fileCount: 1, hasChildren: true, updatedAt: new Date().toISOString() };
  expect(Value.Check(FolderSchema, ok)).toBe(true);
  expect(Value.Check(FolderSchema, { ...ok, name: undefined })).toBe(false);
});

test("PaginatedSchema wraps an item schema", () => {
  const schema = PaginatedSchema(FileSchema);
  const ok = { data: [], pageInfo: { nextCursor: null, hasMore: false } };
  expect(Value.Check(schema, ok)).toBe(true);
});
