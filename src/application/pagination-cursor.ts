import type { Keyset, RepoPage } from "./ports/pagination.ts";

export const encodeCursor = (k: Keyset | null): string | null =>
  k ? Buffer.from(JSON.stringify([k.name, k.id]), "utf8").toString("base64url") : null;

export const decodeCursor = (raw: string | undefined): Keyset | null => {
  if (!raw) return null;
  try {
    const [name, id] = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return typeof name === "string" && typeof id === "string" ? { name, id } : null;
  } catch {
    return null;
  }
};

export const encodeNextCursor = <T extends { name: string; id: string }>(page: RepoPage<T>): string | null => {
  const last = page.items.at(-1);
  return page.hasMore && last ? encodeCursor({ name: last.name, id: last.id }) : null;
};
