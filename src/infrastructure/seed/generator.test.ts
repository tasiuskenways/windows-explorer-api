import { test, expect } from "bun:test";
import { generateTree } from "./generator.ts";

test("generateTree honors the target folder count and wires parent paths", () => {
  const { folders } = generateTree({ folderCount: 50, maxChildren: 4, filesPerFolder: 2, seed: 1 });
  expect(folders.length).toBe(50);
  const roots = folders.filter((f) => f.parentId === null);
  expect(roots.length).toBeGreaterThan(0);
  for (const f of folders) {
    if (f.parentId) {
      const parent = folders.find((p) => p.id === f.parentId)!;
      expect(f.path.startsWith(parent.path + ".")).toBe(true);
      expect(f.depth).toBe(parent.depth + 1);
    }
  }
});
