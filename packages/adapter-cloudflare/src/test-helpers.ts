import { env } from 'cloudflare:test';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

// Typed handles on the real miniflare bindings, so every test file does not re-cast them.
export const DB = env.DB as D1Database;
export const BUCKET = env.BUCKET as R2Bucket;

export async function clearBucket(): Promise<void> {
	const { objects } = await BUCKET.list();
	if (objects.length) await BUCKET.delete(objects.map((o) => o.key));
}

export async function bucketKeys(): Promise<string[]> {
	const { objects } = await BUCKET.list();
	return objects.map((o) => o.key).sort();
}

export function clearTables(): Promise<unknown> {
	return DB.batch(
		['content', 'asset_refs', 'asset_sweep', 'meta'].map((t) => DB.prepare(`DELETE FROM ${t}`))
	);
}
