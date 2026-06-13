import { test, expect } from "bun:test";
import { parsePage } from "./parse-page.ts";
import { encodeCursor } from "../application/pagination-cursor.ts";

test("clamps limit to the max and decodes the cursor", () => {
  const cursor = encodeCursor({ name: "A", id: "1" })!;
  const page = parsePage({ limit: "9999", cursor }, { def: 100, max: 500 });
  expect(page.limit).toBe(500);
  expect(page.after).toEqual({ name: "A", id: "1" });
});

test("falls back to the default limit and null cursor", () => {
  const page = parsePage({}, { def: 100, max: 500 });
  expect(page.limit).toBe(100);
  expect(page.after).toBeNull();
});
