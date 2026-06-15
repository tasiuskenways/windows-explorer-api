import { test, expect } from "bun:test";
import { getFolderContents } from "./get-folder-contents.ts";
import { NotFoundError } from "../../domain/errors.ts";
import type { FolderRepository } from "../ports/folder-repository.ts";
import type { FileRepository } from "../ports/file-repository.ts";

const folderRec = (id: string, parentId: string | null = null) => ({
  id, parentId, name: id, path: id, depth: 0, subfolderCount: 1, fileCount: 1,
  createdAt: new Date(0), updatedAt: new Date(0),
});

const folderRepo = (exists: boolean): FolderRepository => ({
  findById: async (id) => (exists ? folderRec(id) : null),
  findChildren: async () => ({ items: [folderRec("child", "root")], hasMore: false }),
  findRoots: async () => ({ items: [], hasMore: false }),
  findManyByIds: async () => [],
  findAncestors: async () => [],
  findSubtree: async () => [],
  findNamesByParent: async () => [],
  createChild: async () => { throw new Error("not used"); },
  rename: async () => { throw new Error("not used"); },
  delete: async () => { throw new Error("not used"); },
});

const fileRepo: FileRepository = {
  findByFolder: async () => ({ items: [{ id: "f", folderId: "root", name: "f.txt", extension: "txt", sizeBytes: 1, createdAt: new Date(0), updatedAt: new Date(0) }], hasMore: false }),
  findById: async () => null,
  findNamesByFolder: async () => [],
  create: async () => { throw new Error("not used"); },
  rename: async () => { throw new Error("not used"); },
  delete: async () => { throw new Error("not used"); },
};

test("assembles folder + child folders + files", async () => {
  const result = await getFolderContents(folderRepo(true), fileRepo)("root", 100);
  expect(result.folder.id).toBe("root");
  expect(result.folders.data[0]!.id).toBe("child");
  expect(result.files.data[0]!.name).toBe("f.txt");
});

test("throws NotFound for an unknown folder", async () => {
  await expect(getFolderContents(folderRepo(false), fileRepo)("nope", 100)).rejects.toBeInstanceOf(NotFoundError);
});
