import { test, expect } from "bun:test";
import { extensionFromName, nextWindowsName, requireNonEmptyName } from "./windows-names.ts";

test("uses the base Windows name when it is available", () => {
  expect(nextWindowsName("New folder", [])).toBe("New folder");
});

test("adds a numeric suffix when the base folder name exists", () => {
  expect(nextWindowsName("New folder", ["New folder", "New folder (2)"])).toBe("New folder (3)");
});

test("adds a numeric suffix before a file extension", () => {
  expect(nextWindowsName("New Text Document.txt", ["New Text Document.txt"])).toBe("New Text Document (2).txt");
});

test("parses a lowercase extension from the final filename segment", () => {
  expect(extensionFromName("Budget.Final.XLSX")).toBe("xlsx");
  expect(extensionFromName("README")).toBeNull();
});

test("rejects blank names", () => {
  expect(() => requireNonEmptyName("   ")).toThrow("name is required");
});
