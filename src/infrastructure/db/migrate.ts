import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "./client.ts";

const dir = join(import.meta.dir, "migrations");
const out = await readdir(dir);
for (const file of out.filter((f) => f.endsWith(".sql")).sort()) {
  await sql.file(join(dir, file));
  console.log(`applied ${file}`);
}
await sql.end();
