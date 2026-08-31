import { DB, BUCKET, clearBucket, clearTables, bucketKeys } from './test-helpers.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { putAsset, sha256Hex } from './assets.js';
import { putRecord } from './content.js';
import { maybeSweepAssets, sweepAssets } from './gc.js';

const DAY = 86_400_000;
const T0 = 1_700_000_000_000;

/** Upload a distinct file, the way the admin UI does when a user picks one. */
async function upload(label: string): Promise<string> {
	const bytes = new TextEncoder().encode(label);
	const key = await sha256Hex(bytes);
	await putAsset(BUCKET, key, bytes, { contentType: 'image/png' });
	return key;
}

describe('sweeping orphaned assets', () => {
	beforeEach(async () => {
		await clearBucket();
		await clearTables();
	});

	it('never deletes on the first sight of an orphan', async () => {
		const orphan = await upload('cancelled');

		// An asset uploaded a second ago and one orphaned a year ago look identical here.
		expect(await sweepAssets(DB, BUCKET, { now: T0 })).toMatchObject({
			marked: 1,
			deleted: 0
		});
		expect(await bucketKeys()).toEqual([orphan]);
	});

	it('cancelled edit: the upload is deleted once it has been unreferenced past the grace', async () => {
		const orphan = await upload('cancelled');
		await sweepAssets(DB, BUCKET, { now: T0 }); // marks it

		// Still inside the grace period: an editor could be sitting on it unsaved.
		await sweepAssets(DB, BUCKET, { now: T0 + 6 * DAY });
		expect(await bucketKeys()).toEqual([orphan]);

		expect(await sweepAssets(DB, BUCKET, { now: T0 + 8 * DAY })).toMatchObject({
			deleted: 1
		});
		expect(await bucketKeys()).toEqual([]);
	});

	it('double replace: only the image the record kept survives', async () => {
		const first = await upload('first pick');
		const second = await upload('second pick');
		await putRecord(DB, 'home', { hero: `/assets/${second}` });

		await sweepAssets(DB, BUCKET, { now: T0 });
		await sweepAssets(DB, BUCKET, { now: T0 + 8 * DAY });
		expect(await bucketKeys()).toEqual([second]);
		expect(first).not.toBe(second);
	});

	it('saved content is never swept, however long it sits', async () => {
		const hero = await upload('saved');
		await putRecord(DB, 'home', { hero: `/assets/${hero}` });

		await sweepAssets(DB, BUCKET, { now: T0 });
		await sweepAssets(DB, BUCKET, { now: T0 + 400 * DAY });
		expect(await bucketKeys()).toEqual([hero]);
	});

	it('re-using an asset before the grace runs out clears its mark', async () => {
		const asset = await upload('reused');
		await sweepAssets(DB, BUCKET, { now: T0 }); // marked, nothing references it

		await putRecord(DB, 'home', { hero: `/assets/${asset}` });
		expect(await sweepAssets(DB, BUCKET, { now: T0 + DAY })).toMatchObject({
			unmarked: 1
		});

		// The clock restarts if it is ever orphaned again — the old mark cannot delete it.
		await sweepAssets(DB, BUCKET, { now: T0 + 30 * DAY });
		expect(await bucketKeys()).toEqual([asset]);
	});

	it('deleting the record that held an asset lets it age out', async () => {
		const asset = await upload('orphaned by delete');
		await putRecord(DB, 'home', { hero: `/assets/${asset}` });
		await sweepAssets(DB, BUCKET, { now: T0 });

		await DB.prepare('DELETE FROM asset_refs WHERE record_key = ?').bind('home').run();
		await sweepAssets(DB, BUCKET, { now: T0 + 100 * DAY }); // marks, does not delete
		expect(await bucketKeys()).toEqual([asset]);

		await sweepAssets(DB, BUCKET, { now: T0 + 108 * DAY });
		expect(await bucketKeys()).toEqual([]);
	});

	it('forgets marks for objects that left the bucket some other way', async () => {
		const gone = await upload('deleted by hand');
		await sweepAssets(DB, BUCKET, { now: T0 });
		await BUCKET.delete(gone);

		await sweepAssets(DB, BUCKET, { now: T0 + DAY });
		const { results } = await DB.prepare('SELECT asset_key FROM asset_sweep').all();
		expect(results).toEqual([]);
	});

	it('maybeSweepAssets runs once per interval, not once per save', async () => {
		await upload('orphan');

		expect(await maybeSweepAssets(DB, BUCKET, { now: T0 })).toMatchObject({ marked: 1 });
		expect(await maybeSweepAssets(DB, BUCKET, { now: T0 + 60_000 })).toBeNull();
		expect(await maybeSweepAssets(DB, BUCKET, { now: T0 + 2 * DAY })).not.toBeNull();
	});
});
