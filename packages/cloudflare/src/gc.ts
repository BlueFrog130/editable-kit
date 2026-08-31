import type { D1Database, D1PreparedStatement, R2Bucket } from '@cloudflare/workers-types';

export interface SweepOptions {
	/**
	 * How long an asset must sit unreferenced before it is deleted. Measured from the
	 * first sweep that saw it unreferenced — never from upload — so an editor holding an
	 * uploaded-but-unsaved image, or a record being re-saved right now, is not raced.
	 */
	graceMs?: number;
	/** Override the clock (tests). */
	now?: number;
}

export interface SweepResult {
	scanned: number;
	marked: number;
	unmarked: number;
	deleted: number;
}

const DAY = 86_400_000;

/**
 * Delete assets no record refers to any more: uploads the user cancelled, images that
 * were replaced, whole records that were deleted.
 *
 * Mark and sweep, in two passes over two runs. Nothing is deleted the moment it goes
 * unreferenced — an asset uploaded a second ago and an asset orphaned a year ago look
 * identical, and only the clock since *losing its last reference* is safe to act on.
 *
 * Run it from a Cron Trigger; `maybeSweepAssets` is the no-cron fallback.
 */
export async function sweepAssets(
	db: D1Database,
	bucket: R2Bucket,
	opts: SweepOptions = {}
): Promise<SweepResult> {
	const now = opts.now ?? Date.now();
	const graceMs = opts.graceMs ?? 7 * DAY;

	// ponytail: both sets held in memory. Fine into six figures of assets; page the
	// referenced set by prefix if a site ever outgrows that.
	const refs = await db.prepare('SELECT DISTINCT asset_key FROM asset_refs').all<{
		asset_key: string;
	}>();
	const referenced = new Set(refs.results.map((r) => r.asset_key));
	const marks = await db.prepare('SELECT asset_key, unreferenced_since FROM asset_sweep').all<{
		asset_key: string;
		unreferenced_since: number;
	}>();
	const markedAt = new Map(marks.results.map((r) => [r.asset_key, r.unreferenced_since]));

	const result: SweepResult = { scanned: 0, marked: 0, unmarked: 0, deleted: 0 };
	const statements: D1PreparedStatement[] = [];
	const seen = new Set<string>();
	let cursor: string | undefined;

	do {
		const page = await bucket.list({ cursor, limit: 1000 });
		cursor = page.truncated ? page.cursor : undefined;
		const doomed: string[] = [];

		for (const { key } of page.objects) {
			result.scanned++;
			seen.add(key);
			const since = markedAt.get(key);

			if (referenced.has(key)) {
				// Referenced again (or referenced all along) — clear any mark it picked up.
				if (since !== undefined) {
					statements.push(unmark(db, key));
					result.unmarked++;
				}
			} else if (since === undefined) {
				statements.push(
					db
						.prepare(
							'INSERT OR REPLACE INTO asset_sweep (asset_key, unreferenced_since) VALUES (?, ?)'
						)
						.bind(key, now)
				);
				result.marked++;
			} else if (now - since >= graceMs) {
				doomed.push(key);
				statements.push(unmark(db, key));
				result.deleted++;
			}
		}

		if (doomed.length) await bucket.delete(doomed);
	} while (cursor);

	// A mark for an object that is no longer in the bucket (deleted by hand, or by an R2
	// lifecycle rule) would otherwise sit there forever.
	for (const key of markedAt.keys()) if (!seen.has(key)) statements.push(unmark(db, key));
	for (let i = 0; i < statements.length; i += 50) await db.batch(statements.slice(i, i + 50));
	return result;
}

/**
 * Sweep at most once per `everyMs`, tracked in D1. For deployments with no Cron Trigger:
 * call it from a content write under `waitUntil`, and cleanup rides along with editing.
 */
export async function maybeSweepAssets(
	db: D1Database,
	bucket: R2Bucket,
	opts: SweepOptions & { everyMs?: number } = {}
): Promise<SweepResult | null> {
	const now = opts.now ?? Date.now();
	const everyMs = opts.everyMs ?? DAY;
	// Claim the slot first: the write is the lock, so two concurrent requests cannot both sweep.
	const claimed = await db
		.prepare(
			`INSERT INTO meta (key, value) VALUES ('last_sweep', ?1)
			 ON CONFLICT(key) DO UPDATE SET value = ?1 WHERE CAST(meta.value AS INTEGER) <= ?2
			 RETURNING value`
		)
		.bind(String(now), now - everyMs)
		.first<{ value: string }>();
	if (!claimed) return null;
	return sweepAssets(db, bucket, { ...opts, now });
}

function unmark(db: D1Database, key: string): D1PreparedStatement {
	return db.prepare('DELETE FROM asset_sweep WHERE asset_key = ?').bind(key);
}
