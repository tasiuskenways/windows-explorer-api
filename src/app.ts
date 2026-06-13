import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { buildContainer } from "./composition-root.ts";
import { errorHandler } from "./http/error-handler.ts";
import { folderRoutes } from "./http/routes/folders.ts";
import { searchRoutes } from "./http/routes/search.ts";
import { healthRoutes } from "./http/routes/health.ts";
import type { Db } from "./infrastructure/db/client.ts";

export const createApp = (db?: Db) => {
  const c = buildContainer(db);
  return new Elysia()
    .use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }))
    .use(swagger({ path: "/docs", documentation: { info: { title: "Windows Explorer API", version: "1.0.0" } } }))
    .use(errorHandler)
    .group("/api/v1", (app) => app.use(healthRoutes).use(folderRoutes(c)).use(searchRoutes(c)));
};
