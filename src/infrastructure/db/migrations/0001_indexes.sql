CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON folders (parent_id);
CREATE INDEX IF NOT EXISTS folders_path_gist_idx ON folders USING gist (path);
CREATE INDEX IF NOT EXISTS folders_name_trgm_idx ON folders USING gin (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS files_name_trgm_idx ON files USING gin (lower(name) gin_trgm_ops);
