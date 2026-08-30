-- Mirrors packages/cloudflare/migrations/0001_init.sql (kept local so
-- `wrangler d1 migrations apply` finds it in the default ./migrations dir).

CREATE TABLE IF NOT EXISTS content (
	key TEXT PRIMARY KEY,
	data TEXT NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
	id TEXT PRIMARY KEY,
	url TEXT NOT NULL,
	created_at INTEGER NOT NULL
);
