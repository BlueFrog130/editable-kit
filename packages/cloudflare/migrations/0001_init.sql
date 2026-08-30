-- editable-kit content storage
-- One row per content record; `data` is the JSON snapshot of a record's fields
-- (each field is either a ProseMirror JSON doc or an { src, alt } image reference).

CREATE TABLE IF NOT EXISTS content (
	key TEXT PRIMARY KEY,
	data TEXT NOT NULL,
	updated_at INTEGER NOT NULL
);

-- Uploaded image references, for later cleanup / GC of orphaned assets.
CREATE TABLE IF NOT EXISTS images (
	id TEXT PRIMARY KEY,
	url TEXT NOT NULL,
	created_at INTEGER NOT NULL
);
