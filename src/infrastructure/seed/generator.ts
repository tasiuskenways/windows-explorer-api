import { uuidv7 } from "uuidv7";
import { buildPath } from "../../domain/ltree-path.ts";

export interface GenOptions {
  folderCount: number;
  maxChildren: number;
  filesPerFolder: number;
  seed: number;
}
export interface GenFolder {
  id: string; parentId: string | null; name: string; path: string; depth: number;
}
export interface GenFile {
  id: string; folderId: string; name: string; extension: string; sizeBytes: number;
}

const EXTS = ["pdf", "docx", "xlsx", "png", "md", "json", "ts", "txt"];

// Small deterministic PRNG so seeded datasets are reproducible across runs.
const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const generateTree = (opts: GenOptions): { folders: GenFolder[]; files: GenFile[] } => {
  const rand = mulberry32(opts.seed);
  const folders: GenFolder[] = [];
  const files: GenFile[] = [];

  const make = (parent: GenFolder | null, index: number): GenFolder => {
    const id = uuidv7();
    const node: GenFolder = {
      id,
      parentId: parent?.id ?? null,
      name: parent ? `Folder ${parent.name}-${index}` : `Drive ${index}`,
      path: buildPath(parent?.path ?? null, id),
      depth: parent ? parent.depth + 1 : 0,
    };
    folders.push(node);
    for (let i = 0; i < opts.filesPerFolder; i++) {
      const ext = EXTS[Math.floor(rand() * EXTS.length)]!;
      files.push({ id: uuidv7(), folderId: id, name: `file-${index}-${i}.${ext}`, extension: ext,
        sizeBytes: Math.floor(rand() * 5_000_000) });
    }
    return node;
  };

  const queue: GenFolder[] = [];
  let created = 0;
  const rootCount = Math.max(1, Math.min(opts.folderCount, 3));
  for (let i = 0; i < rootCount && created < opts.folderCount; i++) { queue.push(make(null, i)); created++; }

  while (created < opts.folderCount && queue.length) {
    const parent = queue.shift()!;
    const childCount = 1 + Math.floor(rand() * opts.maxChildren);
    for (let i = 0; i < childCount && created < opts.folderCount; i++) {
      queue.push(make(parent, i)); created++;
    }
  }
  return { folders, files };
};

export const computeCounts = (folders: GenFolder[], files: GenFile[]) => {
  const sub = new Map<string, number>();
  const fc = new Map<string, number>();
  for (const f of folders) if (f.parentId) sub.set(f.parentId, (sub.get(f.parentId) ?? 0) + 1);
  for (const f of files) fc.set(f.folderId, (fc.get(f.folderId) ?? 0) + 1);
  return { subfolderCount: sub, fileCount: fc };
};
