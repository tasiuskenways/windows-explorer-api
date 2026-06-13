export interface FileRecord {
  id: string;
  folderId: string;
  name: string;
  extension: string | null;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}
