import { test, expect } from "bun:test";
import { createFile, renameFile } from "./create-file.ts";
import { NotFoundError, ValidationError } from "../../domain/errors.ts";
import type { FileRecord } from "../../domain/file.ts";
import type { FolderRecord } from "../../domain/folder.ts";
import type { FolderRepository } from "../ports/folder-repository.ts";
import type { FileRepository, NamedItem } from "../ports/file-repository.ts";

const folderId = "00000000-0000-7000-8000-000000000001";
const fileId = "00000000-0000-7000-8000-000000000002";

const folderRec = (id: string): FolderRecord => ({
  id,
  parentId: null,
  name: "Parent",
  path: id.replaceAll("-", ""),
  depth: 0,
  subfolderCount: 0,
  fileCount: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

const fileRec = (id: string, name: string): FileRecord => ({
  id,
  folderId,
  name,
  extension: name.includes(".") ? name.split(".").at(-1)!.toLowerCase() : null,
  sizeBytes: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

const folderRepo = (parent: FolderRecord | null = folderRec(folderId)): FolderRepository => ({
  findRoots: async () => ({ items: [], hasMore: false }),
  findChildren: async () => ({ items: [], hasMore: false }),
  findById: async () => parent,
  findManyByIds: async () => [],
  findAncestors: async () => [],
  findSubtree: async () => [],
  findNamesByParent: async () => [],
  createChild: async () => { throw new Error("not used"); },
  rename: async () => { throw new Error("not used"); },
  delete: async () => { throw new Error("not used"); },
});

const fileRepo = (siblings: NamedItem[] = []): FileRepository => ({
  findByFolder: async () => ({ items: [], hasMore: false }),
  findNamesByFolder: async () => siblings,
  create: async ({ id, name }) => fileRec(id, name),
  findById: async (id) => fileRec(id, "Existing.txt"),
  rename: async (id, name) => fileRec(id, name),
  delete: async () => { throw new Error("not used"); },
});

test("createFile uses the next Windows text document name", async () => {
  const result = await createFile(folderRepo(), fileRepo([{ id: "s1", name: "New Text Document.txt" }]), () => fileId)(folderId);
  expect(result).toMatchObject({ id: fileId, folderId, name: "New Text Document (2).txt", extension: "txt" });
});

test("createFile throws NotFound when the parent folder is missing", async () => {
  await expect(createFile(folderRepo(null), fileRepo(), () => fileId)(folderId)).rejects.toBeInstanceOf(NotFoundError);
});

test("renameFile trims the name, updates extension, and rejects duplicates", async () => {
  const result = await renameFile(fileRepo([{ id: "s1", name: "Taken.txt" }]))(fileId, "  Notes.md  ");
  expect(result).toMatchObject({ name: "Notes.md", extension: "md" });

  await expect(renameFile(fileRepo([{ id: "s1", name: "Taken.txt" }]))(fileId, "taken.txt")).rejects.toBeInstanceOf(ValidationError);
});
