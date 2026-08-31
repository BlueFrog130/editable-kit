-- editable-kit content + asset storage.

-- One row per content record; `data` is the JSON snapshot of a record's fields.
-- `version` is bumped on every write, for optimistic concurrency (If-Match).
CREATE TABLE IF NOT EXISTS content (
	key TEXT PRIMARY KEY,
	data TEXT NOT NULL,
	version INTEGER NOT NULL DEFAULT 1,
	updated_at INTEGER NOT NULL
);

-- Which records mention which assets. Derived from the record on every write, never
-- incremented by hand, so it cannot drift: the next save of a record rewrites its rows.
CREATE TABLE IF NOT EXISTS asset_refs (
	asset_key TEXT NOT NULL,
	record_key TEXT NOT NULL,
	PRIMARY KEY (asset_key, record_key)
);
CREATE INDEX IF NOT EXISTS asset_refs_by_record ON asset_refs (record_key);

-- Assets seen with no reference, and when they were first seen that way. The sweeper
-- deletes them once they have stayed unreferenced for the grace period.
CREATE TABLE IF NOT EXISTS asset_sweep (
	asset_key TEXT PRIMARY KEY,
	unreferenced_since INTEGER NOT NULL
);

-- Small bookkeeping values (e.g. when the sweeper last ran).
CREATE TABLE IF NOT EXISTS meta (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL
);
