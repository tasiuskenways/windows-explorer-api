import { test, expect, beforeAll, afterAll } from "bun:test";
import { startTestDb, type TestDb } from "../helpers/test-db.ts";
import { createApp } from "../../src/app.ts";
import { folders, files } from "../../src/infrastructure/db/schema.ts";
import { buildPath } from "../../src/domain/ltree-path.ts";
import { uuidv7 } from "uuidv7";

let tdb: TestDb;
let app: ReturnType<typeof createApp>;
const root = uuidv7();
const child = uuidv7();

beforeAll(async () => {
  tdb = await startTestDb();
  const rootPath = buildPath(null, root);
  await tdb.db.insert(folders).values([
    { id: root, parentId: null, name: "Root", path: rootPath, depth: 0, subfolderCount: 1, fileCount: 1 },
    { id: child, parentId: root, name: "Child", path: buildPath(rootPath, child), depth: 1, subfolderCount: 0, fileCount: 0 },
  ]);
  await tdb.db.insert(files).values([{ id: uuidv7(), folderId: root, name: "readme.md", extension: "md", sizeBytes: 10 }]);
  app = createApp(tdb.db);
}, 120000);
afterAll(() => tdb?.stop(), 60000);

const get = (path: string) => app.handle(new Request(`http://localhost/api/v1${path}`));
const jsonRequest = (path: string, method: "POST" | "PATCH", body: unknown) =>
  app.handle(new Request(`http://localhost/api/v1${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }));

test("GET /folders/roots returns the root with hasChildren", async () => {
  const body = await (await get("/folders/roots")).json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0]).toMatchObject({ name: "Root", hasChildren: true });
});

test("GET /folders/:id/contents returns child folders and files", async () => {
  const body = await (await get(`/folders/${root}/contents`)).json();
  expect(body.folders.data[0].name).toBe("Child");
  expect(body.files.data[0].name).toBe("readme.md");
});

test("GET /folders/:id/breadcrumbs returns root->child chain", async () => {
  const body = await (await get(`/folders/${child}/breadcrumbs`)).json();
  expect(body.data.map((b: { name: string }) => b.name)).toEqual(["Root", "Child"]);
});

test("GET /folders/:id/contents 404s for unknown id", async () => {
  const res = await get(`/folders/${uuidv7()}/contents`);
  expect(res.status).toBe(404);
});

test("POST /folders/:id/folders creates a child folder with a Windows default name", async () => {
  const body = await (await jsonRequest(`/folders/${root}/folders`, "POST", {})).json();
  expect(body.data).toMatchObject({ parentId: root, name: "New folder" });
});

test("POST /folders/:id/files creates a text document with a Windows default name", async () => {
  const body = await (await jsonRequest(`/folders/${root}/files`, "POST", {})).json();
  expect(body.data).toMatchObject({ folderId: root, name: "New Text Document.txt", extension: "txt" });
});

test("PATCH folder and file routes rename existing items", async () => {
  const createdFolder = await (await jsonRequest(`/folders/${root}/folders`, "POST", {})).json();
  const folderBody = await (await jsonRequest(`/folders/${createdFolder.data.id}`, "PATCH", { name: "Renamed child" })).json();
  expect(folderBody.data).toMatchObject({ id: createdFolder.data.id, name: "Renamed child" });

  const file = await (await jsonRequest(`/folders/${root}/files`, "POST", {})).json();
  const fileBody = await (await jsonRequest(`/folders/${root}/files/${file.data.id}`, "PATCH", { name: "Notes.md" })).json();
  expect(fileBody.data).toMatchObject({ name: "Notes.md", extension: "md" });
});

test("GET /search finds the child and includes its ancestors", async () => {
  const body = await (await get("/search?q=child")).json();
  expect(body.data[0]).toMatchObject({ type: "folder", name: "Child" });
  expect(body.data[0].ancestors.map((a: { name: string }) => a.name)).toEqual(["Root"]);
});
