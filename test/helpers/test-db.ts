import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import * as schema from "../../src/infrastructure/db/schema.ts";

export interface TestDb { db: ReturnType<typeof drizzle<typeof schema>>; sql: postgres.Sql; stop: () => Promise<void> }

export const startTestDb = async (): Promise<TestDb> => {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer("postgres:17").start();
  const sql = postgres(container.getConnectionUri(), { max: 4 });
  const dir = join(import.meta.dir, "../../src/infrastructure/db/migrations");
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
    await sql.file(join(dir, file));
  }
  return {
    db: drizzle(sql, { schema }),
    sql,
    stop: async () => { await sql.end(); await container.stop(); },
  };
};
