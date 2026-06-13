import { test, expect } from "bun:test";
import { encodeCursor, decodeCursor, encodeNextCursor } from "./pagination-cursor.ts";

test("cursor round-trips name and id", () => {
  const c = encodeCursor({ name: "Résumé.docx", id: "abc-123" })!;
  expect(decodeCursor(c)).toEqual({ name: "Résumé.docx", id: "abc-123" });
});

test("decodeCursor returns null for undefined and garbage", () => {
  expect(decodeCursor(undefined)).toBeNull();
  expect(decodeCursor("!!!not-base64!!!")).toBeNull();
});

test("encodeNextCursor returns null when there is no next page", () => {
  expect(encodeNextCursor({ items: [{ name: "A", id: "1" }], hasMore: false })).toBeNull();
  expect(encodeNextCursor({ items: [{ name: "A", id: "1" }], hasMore: true })).not.toBeNull();
});
