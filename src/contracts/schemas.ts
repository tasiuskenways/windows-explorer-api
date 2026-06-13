import { Type, FormatRegistry, type Static, type TSchema } from "@sinclair/typebox";

FormatRegistry.Set("uuid", (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v));
FormatRegistry.Set("date-time", (v) => !isNaN(Date.parse(v)));

const Uuid = Type.String({ format: "uuid" });

export const FolderSchema = Type.Object({
  id: Uuid,
  parentId: Type.Union([Uuid, Type.Null()]),
  name: Type.String(),
  depth: Type.Integer(),
  subfolderCount: Type.Integer(),
  fileCount: Type.Integer(),
  hasChildren: Type.Boolean(),
  updatedAt: Type.String({ format: "date-time" }),
});
export type Folder = Static<typeof FolderSchema>;

export const FileSchema = Type.Object({
  id: Uuid,
  folderId: Uuid,
  name: Type.String(),
  extension: Type.Union([Type.String(), Type.Null()]),
  sizeBytes: Type.Integer(),
  updatedAt: Type.String({ format: "date-time" }),
});
export type FileItem = Static<typeof FileSchema>;

export const BreadcrumbSchema = Type.Object({ id: Uuid, name: Type.String() });
export type Breadcrumb = Static<typeof BreadcrumbSchema>;

export const TreeNodeSchema = Type.Recursive((self) =>
  Type.Intersect([FolderSchema, Type.Object({ children: Type.Array(self) })]),
);
export type TreeNode = Folder & { children: TreeNode[] };

export const SearchHitSchema = Type.Object({
  type: Type.Union([Type.Literal("folder"), Type.Literal("file")]),
  id: Uuid,
  name: Type.String(),
  ancestors: Type.Array(BreadcrumbSchema),
});
export type SearchHit = Static<typeof SearchHitSchema>;

export const PageInfoSchema = Type.Object({
  nextCursor: Type.Union([Type.String(), Type.Null()]),
  hasMore: Type.Boolean(),
});
export type PageInfo = Static<typeof PageInfoSchema>;

export const PaginatedSchema = <T extends TSchema>(item: T) =>
  Type.Object({ data: Type.Array(item), pageInfo: PageInfoSchema });
export type Paginated<T> = { data: T[]; pageInfo: PageInfo };

export const FolderContentsSchema = Type.Object({
  folder: FolderSchema,
  folders: PaginatedSchema(FolderSchema),
  files: PaginatedSchema(FileSchema),
});
export type FolderContents = Static<typeof FolderContentsSchema>;

export const ApiErrorSchema = Type.Object({
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Unknown()),
  }),
});
export type ApiError = Static<typeof ApiErrorSchema>;
