CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE folders (
  id uuid PRIMARY KEY,
  parent_id uuid REFERENCES folders (id) ON DELETE CASCADE,
  name text NOT NULL,
  path ltree NOT NULL,
  depth integer NOT NULL,
  subfolder_count integer NOT NULL DEFAULT 0,
  file_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE files (
  id uuid PRIMARY KEY,
  folder_id uuid NOT NULL REFERENCES folders (id) ON DELETE CASCADE,
  name text NOT NULL,
  extension text,
  size_bytes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX folders_parent_name_id_idx ON folders (parent_id, name, id);
CREATE INDEX files_folder_name_id_idx ON files (folder_id, name, id);
