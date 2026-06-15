import { test, expect } from "bun:test";
import { deleteFolder } from "./delete-folder.ts";
import { NotFoundError } from "../../domain/errors.ts";
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

const repo = (folder: FolderRecord | null = folderRec(childId, parentId, "Child", 1)) => {
  let deletedId: string | null = null;
  const repository: FolderRepository = {
    findRoots: async () => ({ items: [], hasMore: false }),
    findChildren: async () => ({ items: [], hasMore: false }),
    findById: async (id) => (id === childId ? folder : folderRec(id, null, "Parent")),
    findManyByIds: async () => [],
    findAncestors: async () => [],
    findSubtree: async () => [],
    findNamesByParent: async (): Promise<NamedItem[]> => [],
    createChild: async () => { throw new Error("not used"); },
    rename: async () => { throw new Error("not used"); },
    delete: async (id) => {
      deletedId = id;
      return Boolean(folder);
    },
  };
  return { repository, deletedId: () => deletedId };
};

test("deleteFolder removes an existing folder", async () => {
  const { repository, deletedId } = repo();
  await deleteFolder(repository)(childId);
  expect(deletedId()).toBe(childId);
});

test("deleteFolder throws NotFound when the folder is missing", async () => {
  const { repository } = repo(null);
  await expect(deleteFolder(repository)(childId)).rejects.toBeInstanceOf(NotFoundError);
});
