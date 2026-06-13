import { Elysia, t } from "elysia";
import type { Container } from "../../composition-root.ts";
import { config } from "../../config.ts";
import { parsePage } from "../parse-page.ts";
import { encodeCursor } from "../../application/pagination-cursor.ts";

export const searchRoutes = (c: Container) =>
  new Elysia().get("/search", async ({ query }) => {
    const page = parsePage(query, { def: config.defaultPageLimit, max: config.maxPageLimit });
    const r = await c.search(query.q, query.type ?? "all", page);
    const last = r.items.at(-1);
    const nextCursor = r.hasMore && last ? encodeCursor({ name: last.name, id: last.id }) : null;
    return { data: r.items, pageInfo: { hasMore: r.hasMore, nextCursor } };
  }, {
    query: t.Object({
      q: t.String({ minLength: 1 }),
      type: t.Optional(t.Union([t.Literal("folder"), t.Literal("file"), t.Literal("all")])),
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
    }),
  });
