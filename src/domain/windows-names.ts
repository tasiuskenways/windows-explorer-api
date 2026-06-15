import { ValidationError } from "./errors.ts";

const suffixPattern = (stem: string, extension: string | null) =>
  new RegExp(`^${escapeRegExp(stem)}(?: \\((\\d+)\\))?${extension ? `\\.${escapeRegExp(extension)}` : ""}$`, "i");

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitName = (name: string) => {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return { stem: name, extension: null };
  return { stem: name.slice(0, dot), extension: name.slice(dot + 1) };
};

export const extensionFromName = (name: string): string | null => splitName(name).extension?.toLowerCase() ?? null;

export const requireNonEmptyName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) throw new ValidationError("name is required");
  return trimmed;
};

export const nextWindowsName = (baseName: string, existingNames: string[]): string => {
  const { stem, extension } = splitName(baseName);
  const pattern = suffixPattern(stem, extension);
  const used = new Set<number>();

  for (const name of existingNames) {
    const match = pattern.exec(name);
    if (!match) continue;
    used.add(match[1] ? Number(match[1]) : 1);
  }

  if (!used.has(1)) return baseName;
  let suffix = 2;
  while (used.has(suffix)) suffix++;
  return extension ? `${stem} (${suffix}).${extension}` : `${stem} (${suffix})`;
};
