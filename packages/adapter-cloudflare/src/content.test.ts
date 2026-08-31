import { DB, clearTables } from './test-helpers.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { assetRefs, deleteRecord, getRecord, putRecord } from './content.js';

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);

async function refsOf(record: string): Promise<string[]> {
	const { results } = await DB.prepare(
		'SELECT asset_key FROM asset_refs WHERE record_key = ? ORDER BY asset_key'
	)
		.bind(record)
		.all<{ asset_key: string }>();
	return results.map((r) => r.asset_key);
}

describe('content', () => {
	beforeEach(clearTables);

	it('round-trips a record and bumps its version', async () => {
		expect(await putRecord(DB, 'home', { title: 'one' })).toEqual({ ok: true, version: 1 });
		expect(await putRecord(DB, 'home', { title: 'two' })).toEqual({ ok: true, version: 2 });

		const stored = await getRecord(DB, 'home');
		expect(stored?.data).toEqual({ title: 'two' });
		expect(stored?.version).toBe(2);
	});

	it('refuses a write built on a version someone else already replaced', async () => {
		await putRecord(DB, 'home', { title: 'one' }); // version 1
		await putRecord(DB, 'home', { title: 'theirs' }, { ifMatch: 1 });

		expect(await putRecord(DB, 'home', { title: 'mine' }, { ifMatch: 1 })).toEqual({
			ok: false
		});
		expect((await getRecord(DB, 'home'))?.data).toEqual({ title: 'theirs' });
	});

	it('finds asset keys wherever they sit in the record', () => {
		expect(assetRefs({ hero: { src: `/assets/${A}` }, body: `see /media/${B}?v=2` })).toEqual([
			A,
			B
		]);
		expect(assetRefs({ text: 'no hashes here' })).toEqual([]);
	});

	it('rewrites refs from the record on every save', async () => {
		await putRecord(DB, 'home', { hero: `/assets/${A}` });
		expect(await refsOf('home')).toEqual([A]);

		// Replacing the image drops the old ref in the same save that adds the new one.
		await putRecord(DB, 'home', { hero: `/assets/${B}` });
		expect(await refsOf('home')).toEqual([B]);

		await deleteRecord(DB, 'home');
		expect(await refsOf('home')).toEqual([]);
	});

	it('keeps one ref per record for a shared asset', async () => {
		await putRecord(DB, 'home', { hero: `/assets/${A}` });
		await putRecord(DB, 'about', { hero: `/assets/${A}` });

		await deleteRecord(DB, 'home');
		expect(await refsOf('about')).toEqual([A]); // still referenced by the other record
	});
});
