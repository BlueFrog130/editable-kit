import { BUCKET, clearBucket } from './test-helpers.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { putAsset, serveAsset, sha256Hex } from './assets.js';

const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
const png = { contentType: 'image/png' };

describe('assets', () => {
	beforeEach(clearBucket);

	it('stores bytes under their own hash and dedupes a repeat upload', async () => {
		const key = await sha256Hex(bytes);

		expect(await putAsset(BUCKET, key, bytes, png)).toEqual({ key, deduped: false });
		expect(await putAsset(BUCKET, key, bytes, png)).toEqual({ key, deduped: true });
		expect((await BUCKET.list()).objects).toHaveLength(1);
	});

	it('refuses bytes that are not what the key claims', async () => {
		const lie = await sha256Hex(new Uint8Array([9, 9, 9]));
		await expect(putAsset(BUCKET, lie, bytes, png)).rejects.toThrow(/checksum|sha/i);
		expect(await BUCKET.head(lie)).toBeNull();
	});

	it('serves the asset, then a 304 for a client that already has it', async () => {
		const key = await sha256Hex(bytes);
		await putAsset(BUCKET, key, bytes, png);

		const first = await serveAsset(BUCKET, key, new Request('https://x/a'));
		expect(first.status).toBe(200);
		expect(first.headers.get('content-type')).toBe('image/png');
		expect(first.headers.get('cache-control')).toContain('immutable');
		const etag = first.headers.get('etag')!;
		expect(new Uint8Array(await first.arrayBuffer())).toEqual(bytes);

		const again = await serveAsset(
			BUCKET,
			key,
			new Request('https://x/a', { headers: { 'if-none-match': etag } })
		);
		expect(again.status).toBe(304);
	});

	it('answers a range request with a 206 and the right slice', async () => {
		const key = await sha256Hex(bytes);
		await putAsset(BUCKET, key, bytes, png);

		const res = await serveAsset(
			BUCKET,
			key,
			new Request('https://x/a', { headers: { range: 'bytes=2-5' } })
		);
		expect(res.status).toBe(206);
		expect(res.headers.get('content-range')).toBe(`bytes 2-5/${bytes.length}`);
		expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes.slice(2, 6));
	});

	it('never serves an unexpected stored type as itself', async () => {
		const key = await sha256Hex(bytes);
		await putAsset(BUCKET, key, bytes, { contentType: 'image/svg+xml' });

		const res = await serveAsset(BUCKET, key, new Request('https://x/a'));
		expect(res.headers.get('content-type')).toBe('application/octet-stream');
		expect(res.headers.get('x-content-type-options')).toBe('nosniff');
	});

	it('404s a key that was never uploaded', async () => {
		const res = await serveAsset(BUCKET, await sha256Hex(bytes), new Request('https://x/a'));
		expect(res.status).toBe(404);
	});
});
