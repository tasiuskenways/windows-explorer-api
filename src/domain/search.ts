export interface SearchHitRecord {
  type: "folder" | "file";
  id: string;
  name: string;
  path: string; // folder hit: own path; file hit: containing folder's path
}
