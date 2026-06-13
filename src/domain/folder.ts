export interface FolderRecord {
  id: string;
  parentId: string | null;
  name: string;
  path: string;
  depth: number;
  subfolderCount: number;
  fileCount: number;
  createdAt: Date;
  updatedAt: Date;
}
