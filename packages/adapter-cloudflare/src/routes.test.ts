import { DB, BUCKET, clearBucket, clearTables } from './test-helpers.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { sha256Hex } from './assets.js';
import { getRecord } from './content.js';
import { assetRoutes, contentRoutes, bearerAuth, type Handler } from './routes.js';

const assets = assetRoutes(() => ({ bucket: BUCKET, authorize: bearerAuth('t') }));
const content = contentRoutes(() => ({ db: DB, authorize: bearerAuth('t') }));

/** Call a handler with the key supplied as a route param, the way a framework would. */
async function call(handler: Handler, key: string, init: RequestInit & { url?: string } = {}) {
	const request = new Request(init.url ?? `https://test.local/${key}`, init);
	// A real client sets this; a Request built in-process does not.
	if (init.body instanceof Uint8Array)
		request.headers.set('content-length', String(init.body.byteLength));
	return handler(request, { params: { key } });
}

const png = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
const auth = { authorization: 'Bearer t', 'content-type': 'image/png' };

describe('asset routes', () => {
	beforeEach(async () => {
		await clearBucket();
		await clearTables();
	});

	it('stores an upload and reports the second one as deduped', async () => {
		const key = await sha256Hex(png);
		const first = await call(assets.PUT, key, { method: 'PUT', headers: auth, body: png });
		expect(first.status).toBe(201);

		const second = await call(assets.PUT, key, { method: 'PUT', headers: auth, body: png });
		expect(second.status).toBe(200);
		expect(await second.json()).toEqual({ key, deduped: true });
	});

	it('rejects an upload whose bytes are not the key', async () => {
		const key = await sha256Hex(new Uint8Array([9]));
		const res = await call(assets.PUT, key, { method: 'PUT', headers: auth, body: png });
		expect(res.status).toBe(400);
		expect(await BUCKET.head(key)).toBeNull();
	});

	it('rejects an unauthorized upload, an odd type, and a key that is not a hash', async () => {
		const key = await sha256Hex(png);
		const headers = { 'content-type': 'image/png' };
		expect((await call(assets.PUT, key, { method: 'PUT', headers, body: png })).status).toBe(401);
		expect(
			(
				await call(assets.PUT, key, {
					method: 'PUT',
					headers: { ...auth, 'content-type': 'image/svg+xml' },
					body: png
				})
			).status
		).toBe(415);
		expect((await call(assets.GET, 'not-a-hash')).status).toBe(404);
	});

	it('refuses an upload bigger than the cap before reading it', async () => {
		const big = assetRoutes(() => ({ bucket: BUCKET, authorize: () => true, maxBytes: 4 }));
		const key = await sha256Hex(png);
		const res = await call(big.PUT, key, { method: 'PUT', headers: auth, body: png });
		expect(res.status).toBe(413);
		expect(await BUCKET.head(key)).toBeNull();
	});
});

describe('content routes', () => {
	beforeEach(clearTables);

	const write = (body: unknown, headers: Record<string, string> = {}) =>
		call(content.PUT, 'home', {
			method: 'PUT',
			headers: { authorization: 'Bearer t', 'content-type': 'application/json', ...headers },
			body: JSON.stringify(body)
		});

	it('saves, returns the new version, and reads back', async () => {
		expect(await (await write({ data: { title: 'one' } })).json()).toMatchObject({ version: 1 });

		const res = await call(content.GET, 'home');
		expect(await res.json()).toMatchObject({ data: { title: 'one' }, version: 1 });
	});

	it('409s a save built on a stale version instead of clobbering', async () => {
		await write({ data: { title: 'one' } });
		await write({ data: { title: 'theirs' } }, { 'if-match': '1' });

		expect((await write({ data: { title: 'mine' } }, { 'if-match': '1' })).status).toBe(409);
		expect((await getRecord(DB, 'home'))?.data).toEqual({ title: 'theirs' });
	});

	it('refuses an unauthorized write', async () => {
		const res = await call(content.PUT, 'home', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ data: {} })
		});
		expect(res.status).toBe(401);
	});
});

describe('key resolution', () => {
	beforeEach(clearTables);

	// No route params: a bare Worker mounts these on its own router, so the key has to come
	// off the URL. Encoded, because a record key is arbitrary text.
	it('falls back to the last path segment when no params are given', async () => {
		await content.PUT(
			new Request('https://test.local/api/content/a%2Fb', {
				method: 'PUT',
				headers: { authorization: 'Bearer t', 'content-type': 'application/json' },
				body: JSON.stringify({ data: { title: 'x' } })
			})
		);
		expect((await getRecord(DB, 'a/b'))?.data).toEqual({ title: 'x' });
	});
});
