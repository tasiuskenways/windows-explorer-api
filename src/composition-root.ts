import { db } from "./infrastructure/db/client.ts";
import { createFolderRepository } from "./infrastructure/repositories/drizzle-folder-repository.ts";
import { createFileRepository } from "./infrastructure/repositories/drizzle-file-repository.ts";
import { createSearchRepository } from "./infrastructure/repositories/drizzle-search-repository.ts";
import { getRootFolders } from "./application/use-cases/get-root-folders.ts";
import { getChildren } from "./application/use-cases/get-children.ts";
import { getFolderContents } from "./application/use-cases/get-folder-contents.ts";
import { getBreadcrumbs } from "./application/use-cases/get-breadcrumbs.ts";
import { getFullTree } from "./application/use-cases/get-full-tree.ts";
import { search } from "./application/use-cases/search.ts";
import { createFolder, renameFolder } from "./application/use-cases/create-folder.ts";
import { createFile, renameFile } from "./application/use-cases/create-file.ts";
import type { Db } from "./infrastructure/db/client.ts";

export const buildContainer = (database: Db = db) => {
  const folders = createFolderRepository(database);
  const files = createFileRepository(database);
  const searchRepo = createSearchRepository(database);
  return {
    getRootFolders: getRootFolders(folders),
    getChildren: getChildren(folders),
    getFolderContents: getFolderContents(folders, files),
    getBreadcrumbs: getBreadcrumbs(folders),
    getFullTree: getFullTree(folders),
    search: search(searchRepo, folders),
    createFolder: createFolder(folders),
    renameFolder: renameFolder(folders),
    createFile: createFile(folders, files),
    renameFile: renameFile(files),
  };
};
export type Container = ReturnType<typeof buildContainer>;
