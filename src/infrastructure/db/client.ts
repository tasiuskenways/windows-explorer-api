import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../../config.ts";
import * as schema from "./schema.ts";

export const sql = postgres(config.databaseUrl, { max: 10 });
export const db = drizzle(sql, { schema });
export type Db = typeof db;
