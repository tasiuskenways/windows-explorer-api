import type { Folder, TreeNode } from "@windows-explorer/contracts";

export const buildTree = (rows: Folder[]): TreeNode[] => {
  const nodes = new Map<string, TreeNode>();
  for (const row of rows) nodes.set(row.id, { ...row, children: [] });

  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentId === null) {
      roots.push(node);
      continue;
    }
    const parent = nodes.get(node.parentId);
    if (parent) parent.children.push(node);
    // parent absent => orphan; dropped so a corrupt path can't loop forever.
  }
  return roots;
};
