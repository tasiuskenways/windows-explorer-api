import { Elysia, t } from "elysia";
import type { Container } from "../../composition-root.ts";
import { config } from "../../config.ts";
import { parsePage } from "../parse-page.ts";
import { encodeCursor } from "../../application/pagination-cursor.ts";

const bounds = { def: config.defaultPageLimit, max: config.maxPageLimit };
const pageQuery = t.Object({ limit: t.Optional(t.String()), cursor: t.Optional(t.String()) });

const nextCursorOf = (r: { items: { name: string; id: string }[]; hasMore: boolean }) => {
  const last = r.items.at(-1);
  return r.hasMore && last ? encodeCursor({ name: last.name, id: last.id }) : null;
};

export const folderRoutes = (c: Container) =>
  new Elysia({ prefix: "/folders" })
    .get("/roots", async ({ query }) => {
      const r = await c.getRootFolders(parsePage(query, bounds));
      return { data: r.items, pageInfo: { hasMore: r.hasMore, nextCursor: nextCursorOf(r) } };
    }, { query: pageQuery })

    .get("/tree", async ({ query }) => ({ data: await c.getFullTree(query.rootId ?? null, config.maxTreeNodes) }),
      { query: t.Object({ rootId: t.Optional(t.String()) }) })

    .get("/:id/children", async ({ params, query }) => {
      const r = await c.getChildren(params.id, parsePage(query, bounds));
      return { data: r.items, pageInfo: { hasMore: r.hasMore, nextCursor: nextCursorOf(r) } };
    }, { query: pageQuery })

    .get("/:id/files", async ({ params, query }) => {
      const r = await c.getFolderContents(params.id, parsePage(query, bounds).limit);
      return r.files;
    }, { query: pageQuery })

    .get("/:id/contents", async ({ params, query }) =>
      c.getFolderContents(params.id, parsePage(query, bounds).limit), { query: pageQuery })

    .get("/:id/breadcrumbs", async ({ params }) => ({ data: await c.getBreadcrumbs(params.id) }));
