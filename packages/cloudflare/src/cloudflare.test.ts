import { describe, it, expect } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';
import type { ProseMirrorJSON } from 'editable-kit';
import { createContentApi, type ContentApiConfig } from './server.js';
import { getRecord } from './db.js';
import type { ImageStore } from './images.js';
import { saveToApi, uploadToApi } from './client.js';

// Minimal in-memory D1 covering only the statements db.ts issues.
function fakeD1(): D1Database {
	const content = new Map<string, { key: string; data: string; updated_at: number }>();
	const images = new Map<string, unknown>();
	const prepare = (sql: string) => {
		let args: unknown[] = [];
		const api = {
			bind(...a: unknown[]) {
				args = a;
				return api;
			},
			async first() {
				if (sql.includes('FROM content WHERE key')) return content.get(args[0] as string) ?? null;
				return null;
			},
			async all() {
				if (sql.includes('FROM content ORDER BY'))
					return {
						results: [...content.values()].map((r) => ({ key: r.key, updated_at: r.updated_at }))
					};
				return { results: [] };
			},
			async run() {
				if (sql.includes('INSERT INTO content'))
					content.set(args[0] as string, {
						key: args[0] as string,
						data: args[1] as string,
						updated_at: args[2] as number
					});
				else if (sql.includes('INSERT OR IGNORE INTO images') && !images.has(args[0] as string))
					images.set(args[0] as string, { url: args[1] });
				return { success: true };
			}
		};
		return api;
	};
	return { prepare } as unknown as D1Database;
}

const fakeImages: ImageStore = {
	async put() {
		return { id: 'abc123', url: 'https://img.test/abc123.webp' };
	}
};

// A fetch that dispatches into the SvelteKit handlers, so client + server + db
// round-trip for real (mirrors what SvelteKit does with a thrown `error()`).
function handlerFetch(cfg: ContentApiConfig): typeof fetch {
	const api = createContentApi(() => cfg);
	return (async (input: RequestInfo | URL, init?: RequestInit) => {
		const request = new Request(input as string, init);
		const url = new URL(request.url);
		const event = {
			request,
			url,
			params: { path: url.pathname.slice(1) }
		} as unknown as RequestEvent;
		const method = request.method.toUpperCase() as 'GET' | 'PUT' | 'POST';
		try {
			return await api[method](event);
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e)
				return new Response(null, { status: (e as { status: number }).status });
			throw e;
		}
	}) as typeof fetch;
}

const textDoc: ProseMirrorJSON = {
	type: 'doc',
	content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }]
};

describe('content API round-trip', () => {
	it('upserts and reads a text field', async () => {
		const db = fakeD1();
		const fetchImpl = handlerFetch({ db, images: fakeImages, authorize: () => true });
		const save = saveToApi({ baseUrl: 'https://test.local', fetch: fetchImpl, token: 't' });

		await save('home', { title: textDoc });

		const stored = await getRecord(db, 'home');
		expect((stored!.data as Record<string, unknown>).title).toEqual(textDoc);
	});

	it('stores an image field as src + alt', async () => {
		const db = fakeD1();
		const save = saveToApi({
			baseUrl: 'https://test.local',
			fetch: handlerFetch({ db, images: fakeImages, authorize: () => true })
		});

		await save('hero', { photo: { src: 'https://img.test/abc123.webp', alt: 'a cat' } });

		const stored = await getRecord(db, 'hero');
		expect((stored!.data as Record<string, unknown>).photo).toEqual({
			src: 'https://img.test/abc123.webp',
			alt: 'a cat'
		});
	});

	it('uploadToApi posts the picked file and returns its URL', async () => {
		const upload = uploadToApi({
			baseUrl: 'https://test.local',
			fetch: handlerFetch({ db: fakeD1(), images: fakeImages, authorize: () => true }),
			token: 't'
		});

		const file = new File([new Uint8Array([1, 2, 3])], 'cat.webp', { type: 'image/webp' });
		expect(await upload(file)).toBe('https://img.test/abc123.webp');
	});

	it('rejects writes when unauthorized', async () => {
		const fetchImpl = handlerFetch({ db: fakeD1(), images: fakeImages, authorize: () => false });
		const res = await fetchImpl('https://test.local/content/home', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ data: {} })
		});
		expect(res.status).toBe(401);
	});
});
