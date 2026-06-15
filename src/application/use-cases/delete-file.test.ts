import { test, expect } from "bun:test";
import { deleteFile } from "./delete-file.ts";
import { NotFoundError } from "../../domain/errors.ts";
import type { FileRecord } from "../../domain/file.ts";
import type { FileRepository, NamedItem } from "../ports/file-repository.ts";

const folderId = "00000000-0000-7000-8000-000000000001";
const fileId = "00000000-0000-7000-8000-000000000002";

const fileRec = (id: string): FileRecord => ({
  id,
  folderId,
  name: "Existing.txt",
  extension: "txt",
  sizeBytes: 0,
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

const repo = (file: FileRecord | null = fileRec(fileId)) => {
  let deletedId: string | null = null;
  const repository: FileRepository = {
    findByFolder: async () => ({ items: [], hasMore: false }),
    findById: async (id) => (id === fileId ? file : null),
    findNamesByFolder: async (): Promise<NamedItem[]> => [],
    create: async () => { throw new Error("not used"); },
    rename: async () => { throw new Error("not used"); },
    delete: async (id) => {
      deletedId = id;
      return Boolean(file);
    },
  };
  return { repository, deletedId: () => deletedId };
};

test("deleteFile removes an existing file", async () => {
  const { repository, deletedId } = repo();
  await deleteFile(repository)(fileId);
  expect(deletedId()).toBe(fileId);
});

test("deleteFile throws NotFound when the file is missing", async () => {
  const { repository } = repo(null);
  await expect(deleteFile(repository)(fileId)).rejects.toBeInstanceOf(NotFoundError);
});
