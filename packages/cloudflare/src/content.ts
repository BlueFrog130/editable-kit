import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';

/** A stored record: field name -> value (each a ProseMirror JSON document). */
export type ContentRecord = Record<string, unknown>;

/** A list region stores an array of records under one key. */
export type StoredData = ContentRecord | ContentRecord[];

export interface StoredRecord {
	key: string;
	data: StoredData;
	/** Bumped on every write. Pass it back as `ifMatch` to detect a clobber. */
	version: number;
	updatedAt: number;
}

interface ContentRow {
	key: string;
	data: string;
	version: number;
	updated_at: number;
}

/** Read a single content record. Returns null if it doesn't exist. */
export async function getRecord(db: D1Database, key: string): Promise<StoredRecord | null> {
	const row = await db
		.prepare('SELECT key, data, version, updated_at FROM content WHERE key = ?')
		.bind(key)
		.first<ContentRow>();
	if (!row) return null;
	return {
		key: row.key,
		data: JSON.parse(row.data) as StoredData,
		version: row.version,
		updatedAt: row.updated_at
	};
}

/** List record keys, most-recently-updated first. */
export async function listRecords(
	db: D1Database
): Promise<{ key: string; version: number; updatedAt: number }[]> {
	const { results } = await db
		.prepare('SELECT key, version, updated_at FROM content ORDER BY updated_at DESC')
		.all<{ key: string; version: number; updated_at: number }>();
	return results.map((r) => ({ key: r.key, version: r.version, updatedAt: r.updated_at }));
}

/**
 * Every asset key a record mentions. Derived from the record itself on each write, so the
 * ref table cannot drift out of agreement with the content — the next save repairs
 * whatever the last one got wrong.
 *
 * Matched by hash, not by URL prefix, so it does not care where you mounted the asset
 * route. A false positive (64 hex characters in prose) only keeps an asset alive.
 */
export function assetRefs(data: StoredData): string[] {
	const found = JSON.stringify(data).matchAll(/(?:^|[^0-9a-f])([0-9a-f]{64})(?![0-9a-f])/g);
	return [...new Set([...found].map((m) => m[1]))];
}

/**
 * Upsert a whole record (writes are full-record replaces) and rewrite its asset refs.
 *
 * Pass `ifMatch` (the `version` you loaded) to refuse to write over someone else's edit:
 * the result is `{ ok: false }` and nothing changed.
 */
export async function putRecord(
	db: D1Database,
	key: string,
	data: StoredData,
	opts: { ifMatch?: number } = {}
): Promise<{ ok: true; version: number } | { ok: false }> {
	const row = await db
		.prepare(
			`INSERT INTO content (key, data, version, updated_at) VALUES (?1, ?2, 1, ?3)
			 ON CONFLICT(key) DO UPDATE SET
				 data = excluded.data,
				 version = content.version + 1,
				 updated_at = excluded.updated_at
			 WHERE ?4 IS NULL OR content.version = ?4
			 RETURNING version`
		)
		.bind(key, JSON.stringify(data), Date.now(), opts.ifMatch ?? null)
		.first<{ version: number }>();
	if (!row) return { ok: false };

	// ponytail: refs are written after the record, not in one transaction with it. A crash
	// between the two leaves refs stale, which the sweeper's grace period outlives and the
	// next save of this record repairs. Fold them into one batch if that stops holding.
	await replaceRefs(db, key, assetRefs(data));
	return { ok: true, version: row.version };
}

/** Delete a record and drop its refs — the assets themselves age out through the sweeper. */
export async function deleteRecord(db: D1Database, key: string): Promise<void> {
	await db.batch([
		db.prepare('DELETE FROM content WHERE key = ?').bind(key),
		db.prepare('DELETE FROM asset_refs WHERE record_key = ?').bind(key)
	]);
}

function replaceRefs(db: D1Database, key: string, assets: string[]): Promise<unknown> {
	const statements: D1PreparedStatement[] = [
		db.prepare('DELETE FROM asset_refs WHERE record_key = ?').bind(key),
		...assets.map((asset) =>
			db
				.prepare('INSERT OR IGNORE INTO asset_refs (asset_key, record_key) VALUES (?, ?)')
				.bind(asset, key)
		)
	];
	return db.batch(statements);
}
