import type { D1Database } from '@cloudflare/workers-types';

/** A stored record: field name -> value (ProseMirror JSON doc or { src, alt }). */
export type ContentRecord = Record<string, unknown>;

/** A list region stores an array of records under one key. */
export type StoredData = ContentRecord | ContentRecord[];

export interface StoredRecord {
	key: string;
	data: StoredData;
	updatedAt: number;
}

interface ContentRow {
	key: string;
	data: string;
	updated_at: number;
}

/** Read a single content record. Returns null if it doesn't exist. */
export async function getRecord(db: D1Database, key: string): Promise<StoredRecord | null> {
	const row = await db
		.prepare('SELECT key, data, updated_at FROM content WHERE key = ?')
		.bind(key)
		.first<ContentRow>();
	if (!row) return null;
	return { key: row.key, data: JSON.parse(row.data) as StoredData, updatedAt: row.updated_at };
}

/** List record keys, most-recently-updated first. */
export async function listRecords(db: D1Database): Promise<{ key: string; updatedAt: number }[]> {
	const { results } = await db
		.prepare('SELECT key, updated_at FROM content ORDER BY updated_at DESC')
		.all<{ key: string; updated_at: number }>();
	return results.map((r) => ({ key: r.key, updatedAt: r.updated_at }));
}

/** Upsert a whole content record (writes are idempotent full-record replaces). */
export async function putRecord(db: D1Database, key: string, data: StoredData): Promise<void> {
	await db
		.prepare(
			`INSERT INTO content (key, data, updated_at) VALUES (?, ?, ?)
			 ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
		)
		.bind(key, JSON.stringify(data), Date.now())
		.run();
}

/** Record an uploaded image reference for later cleanup. */
export async function recordImage(db: D1Database, id: string, url: string): Promise<void> {
	await db
		.prepare('INSERT OR IGNORE INTO images (id, url, created_at) VALUES (?, ?, ?)')
		.bind(id, url, Date.now())
		.run();
}
