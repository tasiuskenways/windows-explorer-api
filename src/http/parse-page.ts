import type { PageQuery } from "../application/ports/pagination.ts";
import { decodeCursor } from "../application/pagination-cursor.ts";

export const parsePage = (
  q: { limit?: string; cursor?: string },
  bounds: { def: number; max: number },
): PageQuery => {
  const requested = q.limit ? Number(q.limit) : bounds.def;
  const limit = Number.isFinite(requested) ? Math.min(Math.max(1, requested), bounds.max) : bounds.def;
  return { limit, after: decodeCursor(q.cursor) };
};
