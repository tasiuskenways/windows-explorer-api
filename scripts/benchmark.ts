import { performance } from "node:perf_hooks";
import { sql, db } from "../src/infrastructure/db/client.ts";
import { createFolderRepository } from "../src/infrastructure/repositories/drizzle-folder-repository.ts";
import { createSearchRepository } from "../src/infrastructure/repositories/drizzle-search-repository.ts";

const folders = createFolderRepository(db);
const searchRepo = createSearchRepository(db);

const time = async (label: string, fn: () => Promise<unknown>) => {
  const t = performance.now();
  await fn();
  console.log(`${label}: ${(performance.now() - t).toFixed(1)} ms`);
};

const [root] = await sql`SELECT id FROM folders WHERE parent_id IS NULL LIMIT 1`;
if (!root) { console.error("no folders — run db:seed first"); process.exit(1); }

await time("findRoots(100)", () => folders.findRoots({ limit: 100, after: null }));
await time("findChildren(100)", () => folders.findChildren(root.id as string, { limit: 100, after: null }));
await time("search('file', all, 50)", () => searchRepo.search("file", "all", { limit: 50, after: null }));
await time("findAncestors(leaf)", async () => {
  const [leaf] = await sql`SELECT id FROM folders ORDER BY depth DESC LIMIT 1`;
  if (leaf) await folders.findAncestors(leaf.id as string);
});

await sql.end();
