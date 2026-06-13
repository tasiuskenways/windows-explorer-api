import { test, expect } from "bun:test";
import { buildTree } from "./tree-builder.ts";
import type { Folder } from "@windows-explorer/contracts";

const f = (id: string, parentId: string | null, name: string): Folder => ({
  id, parentId, name, depth: 0, subfolderCount: 0, fileCount: 0, hasChildren: false,
  updatedAt: "2026-01-01T00:00:00.000Z",
});

test("builds a nested tree from a flat list in any order", () => {
  const rows = [f("c", "a", "C"), f("a", null, "A"), f("b", "a", "B")];
  const tree = buildTree(rows);
  expect(tree.map((n) => n.id)).toEqual(["a"]);
  expect(tree[0]!.children.map((n) => n.id).sort()).toEqual(["b", "c"]);
});

test("ignores rows whose parent is absent (cycle/orphan guard)", () => {
  const rows = [f("x", "missing", "X"), f("r", null, "R")];
  const tree = buildTree(rows);
  expect(tree.map((n) => n.id)).toEqual(["r"]);
});
