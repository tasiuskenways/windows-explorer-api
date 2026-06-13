import { test, expect } from "bun:test";
import { search } from "./search.ts";
import type { SearchRepository } from "../ports/search-repository.ts";
import type { FolderRepository } from "../ports/folder-repository.ts";
import { uuidToLabel } from "../../domain/ltree-path.ts";

const A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const path = `${uuidToLabel(A)}.${uuidToLabel(B)}`;

const searchRepo: SearchRepository = {
  search: async () => ({ items: [{ type: "folder", id: B, name: "Beta", path }], hasMore: false }),
};
const folderRepo = {
  findManyByIds: async (ids: string[]) =>
    ids.map((id) => ({ id, parentId: null, name: id === A ? "Alpha" : "Beta", path: "", depth: 0, subfolderCount: 0, fileCount: 0, createdAt: new Date(0), updatedAt: new Date(0) })),
} as unknown as FolderRepository;

test("search enriches a folder hit with its ancestor chain (excluding self)", async () => {
  const result = await search(searchRepo, folderRepo)("bet", "all", { limit: 50, after: null });
  expect(result.items[0]!.ancestors).toEqual([{ id: A, name: "Alpha" }]);
});
