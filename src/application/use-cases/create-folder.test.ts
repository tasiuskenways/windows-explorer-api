import { test, expect } from "bun:test";
import { createFolder, renameFolder } from "./create-folder.ts";
import { NotFoundError, ValidationError } from "../../domain/errors.ts";
import type { FolderRecord } from "../../domain/folder.ts";
import type { FolderRepository, NamedItem } from "../ports/folder-repository.ts";

const parentId = "00000000-0000-7000-8000-000000000001";
const childId = "00000000-0000-7000-8000-000000000002";

const folderRec = (id: string, parentIdValue: string | null, name: string, depth = 0): FolderRecord => ({
  id,
  parentId: parentIdValue,
  name,
  path: id.replaceAll("-", ""),
  depth,
  subfolderCount: 0,
  fileCount: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

const repo = (siblings: NamedItem[] = [], parent: FolderRecord | null = folderRec(parentId, null, "Parent")): FolderRepository => ({
  findRoots: async () => ({ items: [], hasMore: false }),
  findChildren: async () => ({ items: [], hasMore: false }),
  findById: async (id) => (id === parentId ? parent : folderRec(id, parentId, "Existing", 1)),
  findManyByIds: async () => [],
  findAncestors: async () => [],
  findSubtree: async () => [],
  findNamesByParent: async () => siblings,
  createChild: async ({ id, parent, name }) => folderRec(id, parent.id, name, parent.depth + 1),
  rename: async (id, name) => folderRec(id, parentId, name, 1),
});

test("createFolder uses the next Windows default name", async () => {
  const result = await createFolder(repo([{ id: "s1", name: "New folder" }]), () => childId)(parentId);
  expect(result).toMatchObject({ id: childId, parentId, name: "New folder (2)", hasChildren: false });
});

test("createFolder throws NotFound when the parent folder is missing", async () => {
  await expect(createFolder(repo([], null), () => childId)(parentId)).rejects.toBeInstanceOf(NotFoundError);
});

test("renameFolder trims the name and rejects duplicate siblings", async () => {
  const result = await renameFolder(repo([{ id: "s1", name: "Taken" }]))(childId, "  Reports  ");
  expect(result.name).toBe("Reports");

  await expect(renameFolder(repo([{ id: "s1", name: "Taken" }]))(childId, "Taken")).rejects.toBeInstanceOf(ValidationError);
});
