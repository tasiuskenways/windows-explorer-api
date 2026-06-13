import { sql, db } from "../db/client.ts";
import { folders, files } from "../db/schema.ts";
import { generateTree, computeCounts } from "./generator.ts";

const folderCount = Number(process.env.SEED_FOLDERS ?? 500);
const { folders: f, files: fi } = generateTree({
  folderCount, maxChildren: 5, filesPerFolder: 3, seed: 42,
});
const { subfolderCount, fileCount } = computeCounts(f, fi);

await db.delete(files);
await db.delete(folders);

const chunk = <T>(arr: T[], n: number) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

for (const batch of chunk(f, 1000)) {
  await db.insert(folders).values(batch.map((x) => ({
    id: x.id, parentId: x.parentId, name: x.name, path: x.path, depth: x.depth,
    subfolderCount: subfolderCount.get(x.id) ?? 0, fileCount: fileCount.get(x.id) ?? 0,
  })));
}
for (const batch of chunk(fi, 1000)) {
  await db.insert(files).values(batch);
}
console.log(`seeded ${f.length} folders, ${fi.length} files`);
await sql.end();
