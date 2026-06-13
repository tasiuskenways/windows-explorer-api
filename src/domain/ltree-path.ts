export const uuidToLabel = (id: string): string => id.replaceAll("-", "").toLowerCase();

export const labelToUuid = (label: string): string =>
  `${label.slice(0, 8)}-${label.slice(8, 12)}-${label.slice(12, 16)}-${label.slice(16, 20)}-${label.slice(20)}`;

export const buildPath = (parentPath: string | null, id: string): string =>
  parentPath ? `${parentPath}.${uuidToLabel(id)}` : uuidToLabel(id);

export const ancestorIdsFromPath = (path: string, includeSelf: boolean): string[] => {
  const labels = path.split(".");
  const slice = includeSelf ? labels : labels.slice(0, -1);
  return slice.map(labelToUuid);
};
