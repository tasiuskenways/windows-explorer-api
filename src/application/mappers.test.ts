import { test, expect } from "bun:test";
import { toFolderDto } from "./mappers.ts";
import type { FolderRecord } from "../domain/folder.ts";

test("toFolderDto derives hasChildren and drops internal fields", () => {
  const rec: FolderRecord = {
    id: "a", parentId: null, name: "A", path: "a", depth: 0,
    subfolderCount: 2, fileCount: 0, createdAt: new Date(0), updatedAt: new Date(0),
  };
  const dto = toFolderDto(rec);
  expect(dto.hasChildren).toBe(true);
  expect(dto).not.toHaveProperty("path");
  expect(dto.updatedAt).toBe("1970-01-01T00:00:00.000Z");
});
