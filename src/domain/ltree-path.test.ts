import { test, expect } from "bun:test";
import { uuidToLabel, labelToUuid, buildPath, ancestorIdsFromPath } from "./ltree-path.ts";

test("uuid <-> label round-trips", () => {
  const id = "0190f3a1-2b4c-7d8e-9f01-23456789abcd";
  const label = uuidToLabel(id);
  expect(label).toBe("0190f3a12b4c7d8e9f0123456789abcd");
  expect(labelToUuid(label)).toBe(id);
});

test("buildPath appends the child label to the parent path", () => {
  expect(buildPath(null, "0190f3a1-2b4c-7d8e-9f01-23456789abcd"))
    .toBe("0190f3a12b4c7d8e9f0123456789abcd");
  expect(buildPath("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "0190f3a1-2b4c-7d8e-9f01-23456789abcd"))
    .toBe("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.0190f3a12b4c7d8e9f0123456789abcd");
});

test("ancestorIdsFromPath returns ids in root->node order, excluding self when asked", () => {
  const path = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  expect(ancestorIdsFromPath(path, false)).toEqual(["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"]);
  expect(ancestorIdsFromPath(path, true)).toEqual([
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  ]);
});
