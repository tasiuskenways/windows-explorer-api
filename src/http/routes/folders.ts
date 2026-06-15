import { Elysia, t } from "elysia";
import type { Container } from "../../composition-root.ts";
import { config } from "../../config.ts";
import { parsePage } from "../parse-page.ts";
import { encodeCursor } from "../../application/pagination-cursor.ts";
import { CreateItemRequestSchema, RenameItemRequestSchema } from "../../contracts/schemas.ts";

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

    .post("/:id/folders", async ({ params, body }) =>
      ({ data: await c.createFolder(params.id, body.name) }), { body: CreateItemRequestSchema })

    .patch("/:id", async ({ params, body }) =>
      ({ data: await c.renameFolder(params.id, body.name) }), { body: RenameItemRequestSchema })

    .delete("/:id", async ({ params, set }) => {
      await c.deleteFolder(params.id);
      set.status = 204;
      return undefined;
    })

    .get("/:id/files", async ({ params, query }) => {
      const r = await c.getFolderContents(params.id, parsePage(query, bounds).limit);
      return r.files;
    }, { query: pageQuery })

    .post("/:id/files", async ({ params, body }) =>
      ({ data: await c.createFile(params.id, body.name) }), { body: CreateItemRequestSchema })

    .patch("/:id/files/:fileId", async ({ params, body }) =>
      ({ data: await c.renameFile(params.fileId, body.name) }), { body: RenameItemRequestSchema })

    .delete("/:id/files/:fileId", async ({ params, set }) => {
      await c.deleteFile(params.fileId);
      set.status = 204;
      return undefined;
    })

    .get("/:id/contents", async ({ params, query }) =>
      c.getFolderContents(params.id, parsePage(query, bounds).limit), { query: pageQuery })

    .get("/:id/breadcrumbs", async ({ params }) => ({ data: await c.getBreadcrumbs(params.id) }));
