import type { FolderRepository } from "../ports/folder-repository.ts";
import { toFolderDto } from "../mappers.ts";
import { buildTree } from "../../domain/tree-builder.ts";

export const getFullTree = (repo: FolderRepository) => async (rootId: string | null, maxNodes: number) => {
  const rows = await repo.findSubtree(rootId, maxNodes);
  return buildTree(rows.map(toFolderDto));
};
