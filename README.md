# windows-explorer-api

Backend for the Windows Explorer–style web app. Elysia + Drizzle ORM + PostgreSQL. The frontend (`windows-explorer-web`) is a separate repo and consumes this API at `/api/v1`. Swagger UI is available at `/docs`.

Stack: Bun · TypeScript (strict) · Elysia · Drizzle ORM · PostgreSQL (`ltree`, `pg_trgm`).

---

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres
bun install
bun run db:migrate
bun run db:seed
bun run dev        # api on :3000
```

---

## Architecture — hexagonal layering

```
src/
  domain/          Pure logic. No framework, no DB.
    folder.ts      FolderRecord interface
    file.ts        FileRecord interface
    errors.ts      NotFoundError, ValidationError
    ltree-path.ts  uuidToLabel / labelToUuid / buildPath / ancestorIdsFromPath
    tree-builder.ts  flat -> nested O(n) map pass
  application/     Use cases over repository interfaces (ports).
    ports/         FolderRepository, FileRepository, SearchRepository
    use-cases/     get-root-folders, get-children, get-folder-contents,
                   get-breadcrumbs, get-full-tree, search
    mappers.ts     FolderRecord -> Folder DTO, FileRecord -> FileItem DTO
    pagination-cursor.ts  base64url keyset encode/decode
  infrastructure/  Drizzle adapters, DB pool, migrations, seed.
    db/            schema.ts, client.ts, migrations/
    repositories/  drizzle-folder-repository.ts, drizzle-file-repository.ts,
                   drizzle-search-repository.ts
    seed/          generator.ts (deterministic PRNG), seed.ts
  http/            Elysia inbound adapter: routes, validation, error handler.
    routes/        folders.ts, search.ts, health.ts
  contracts/       TypeBox schemas + TypeScript types (inlined from shared package).
  composition-root.ts   wires concrete repos -> use cases
  index.ts              Elysia bootstrap
```

Dependency inversion: use cases depend on repository interfaces; Drizzle implementations are injected at the composition root. Domain has zero framework imports.

---

## Data model

### `folders`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | UUIDv7, generated in the app layer |
| `parent_id` | `uuid` NULL FK -> `folders(id)` | NULL = root; ON DELETE CASCADE |
| `name` | `text` NOT NULL | |
| `path` | `ltree` NOT NULL | dot-joined ancestor labels; label = 32-char hex UUID (dashes stripped) |
| `depth` | `int` NOT NULL | `nlevel(path)` |
| `subfolder_count` | `int` NOT NULL DEFAULT 0 | denormalized; avoids N+1 on chevron render |
| `file_count` | `int` NOT NULL DEFAULT 0 | denormalized |
| `created_at` / `updated_at` | `timestamptz` | |

### `files`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | UUIDv7 |
| `folder_id` | `uuid` NOT NULL FK -> `folders(id)` | ON DELETE CASCADE |
| `name` | `text` NOT NULL | |
| `extension` | `text` NULL | lowercase, no dot |
| `size_bytes` | `bigint` NOT NULL DEFAULT 0 | |
| `created_at` / `updated_at` | `timestamptz` | |

### Indexes

| Index | Type | Purpose |
|---|---|---|
| `folders_parent_id_idx` | btree | primary children lookup, O(log n) |
| `folders_parent_name_id_idx` | btree | keyset-ordered child pages |
| `folders_path_gist_idx` | GiST | `<@` subtree and `@>` ancestor queries |
| `folders_name_trgm_idx` | GIN / `gin_trgm_ops` | fuzzy folder name search |
| `files_folder_name_id_idx` | btree | keyset-ordered file pages |
| `files_name_trgm_idx` | GIN / `gin_trgm_ops` | fuzzy file name search |

UUIDv7 is generated in the application layer. Time-ordered bytes keep btree inserts locally sequential.

---

## Algorithms

**Flat -> nested** (`/folders/tree`): one O(n) pass builds an `id -> TreeNode` map and links each node to its parent's `children` array, then returns roots. Cycle-guarded.

**Keyset pagination**: children and files are ordered by `(name, id)`. The cursor is a `base64url(JSON([name, id]))` of the last item. No `OFFSET`; page cost stays O(log n) at any page number.

**Breadcrumbs**: `GET /folders/:id/breadcrumbs` queries `folders a ON a.path @> self.path ORDER BY nlevel(a.path)` — a single index-only ltree scan from root to the selected folder.

---

## API

Base: `/api/v1`. Swagger: `/docs`.

| Endpoint | Purpose |
|---|---|
| `GET /folders/roots?limit=&cursor=` | Root folders, keyset page |
| `GET /folders/:id/children?limit=&cursor=` | Direct subfolders |
| `GET /folders/:id/files?limit=&cursor=` | Direct files |
| `GET /folders/:id/contents?limit=` | Folder meta + first page of children + files |
| `GET /folders/:id/breadcrumbs` | Ancestor chain root -> folder |
| `GET /folders/tree?depth=&maxNodes=` | Full nested tree, bounded |
| `GET /search?q=&type=folder\|file\|all&limit=&cursor=` | Name search; hits include ancestor chain |
| `GET /health` | Liveness |

Default `limit`: 100. Hard cap: 500. Tree `maxNodes` default: 5,000.

Responses: `{ data, pageInfo: { nextCursor, hasMore } }` for collections. Errors: `{ error: { code, message, details? } }`.

---

## Scalability

- Indexed `parent_id` (O(log n) children), `ltree` GiST for subtree/ancestor, trigram GIN for fuzzy search.
- Keyset pagination — no OFFSET; cost stays O(log n) at any page.
- Denormalized subfolder/file counts avoid N+1 on tree render.
- Connection pooling (`max: 10`). UUIDv7 keeps btree inserts locally ordered.
- Stateless API — horizontally scalable. Bounded payloads (`limit`/`maxNodes` caps).

---

## Benchmark

```bash
SEED_FOLDERS=200000 bun run db:seed
bun run benchmark
```

Results (50,000 folders / 150,000 files, local Postgres 17):

| Query | Latency |
|---|---|
| `findRoots(100)` | 5.7 ms |
| `findChildren(100)` | 2.1 ms |
| `search('file', all, 50)` | 68.1 ms |
| `findAncestors(leaf)` | 13.4 ms |

---

## Testing

```bash
# Unit tests (no DB)
bun test src

# Integration tests (Testcontainers Postgres — needs Docker)
TESTCONTAINERS_RYUK_DISABLED=true bun test test
```

17 unit tests run without Docker. The integration suite (5 tests) spins up its own Postgres via Testcontainers.
