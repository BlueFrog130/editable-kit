import { json, error, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { getRecord, listRecords, putRecord, recordImage, type StoredData } from './db.js';
import { r2ImageStore, type ImageStore } from './images.js';

export interface ContentApiConfig {
	/** Your D1 database instance (e.g. `event.platform.env.WHATEVER_YOU_NAMED_IT`). */
	db: D1Database;
	/**
	 * Image storage. Pass an R2 bucket instance to store + serve images through
	 * this route, or a custom `ImageStore` (e.g. `cloudflareImagesStore(...)`).
	 */
	images: R2Bucket | ImageStore;
	/**
	 * For R2: absolute base URL images are served from (e.g. a custom domain).
	 * Defaults to this route's own `images/` path, served by the GET handler.
	 */
	imagePublicBase?: string;
	/** Return true to allow a write. Defaults to deny-all — use `bearerAuth(token)`. */
	authorize?: (event: RequestEvent) => boolean | Promise<boolean>;
	/** Called after a successful write, e.g. to fire an SSG deploy hook. */
	onContentChange?: (key: string, event: RequestEvent) => void | Promise<void>;
}

/** Resolve per-request config from the event (read your own `platform.env`). */
export type ConfigResolver = (event: RequestEvent) => ContentApiConfig | Promise<ContentApiConfig>;

/** Bearer-token authorizer. Denies if no token is configured. */
export function bearerAuth(token: string | undefined): (event: RequestEvent) => boolean {
	return (event) => !!token && event.request.headers.get('authorization') === `Bearer ${token}`;
}

/** Fire a deploy hook (SSG rebuild) when content changes. */
export function deployHook(url: string | undefined): ContentApiConfig['onContentChange'] {
	if (!url) return undefined;
	return (_key, event) => {
		const p = fetch(url, { method: 'POST' });
		// adapter-cloudflare exposes waitUntil via platform.context.
		const ctx = (
			event.platform as { context?: { waitUntil(p: Promise<unknown>): void } } | undefined
		)?.context;
		if (ctx) ctx.waitUntil(p);
		else void p;
	};
}

function isR2Bucket(images: R2Bucket | ImageStore): images is R2Bucket {
	return (
		typeof (images as R2Bucket).get === 'function' &&
		typeof (images as R2Bucket).createMultipartUpload === 'function'
	);
}

async function ensureAuth(cfg: ContentApiConfig, event: RequestEvent): Promise<void> {
	const ok = cfg.authorize ? await cfg.authorize(event) : false;
	if (!ok) throw error(401, 'Unauthorized');
}

/**
 * Build SvelteKit `{ GET, PUT, POST }` handlers for a catch-all route named
 * `[...path]`, e.g. `src/routes/api/[...path]/+server.ts`. Routes (relative to
 * the mount):
 *   GET    content            -> list keys
 *   GET    content/:key       -> stored record
 *   PUT    content/:key       -> upsert { data } (authorized)
 *   POST   images             -> multipart upload -> { url } (authorized)
 *   GET    images/:key        -> serve from R2 (when `images` is an R2 bucket)
 */
export function createContentApi(resolve: ConfigResolver): {
	GET: RequestHandler;
	PUT: RequestHandler;
	POST: RequestHandler;
} {
	const GET: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		const sub = event.params.path ?? '';

		if (sub === 'content') return json({ records: await listRecords(cfg.db) });

		if (sub.startsWith('content/')) {
			const key = decodeURIComponent(sub.slice('content/'.length));
			const record = await getRecord(cfg.db, key);
			if (!record) throw error(404, 'Not found');
			return json(
				{ data: record.data, updatedAt: record.updatedAt },
				{ headers: { 'cache-control': 'public, max-age=60' } }
			);
		}

		if (sub.startsWith('images/') && isR2Bucket(cfg.images)) {
			const object = await cfg.images.get(decodeURIComponent(sub.slice('images/'.length)));
			if (!object) throw error(404, 'Not found');
			// Served same-origin as the app, so never serve svg/html inline: pin the
			// content-type to a raster-image allowlist and block sniffing/scripts.
			const ct = object.httpMetadata?.contentType ?? '';
			const safeType = /^image\/(png|jpe?g|gif|webp|avif)$/.test(ct)
				? ct
				: 'application/octet-stream';
			const headers = new Headers();
			headers.set('content-type', safeType);
			headers.set('x-content-type-options', 'nosniff');
			headers.set('content-security-policy', "sandbox; default-src 'none'");
			headers.set('etag', object.httpEtag);
			headers.set('cache-control', 'public, max-age=31536000, immutable');
			return new Response(object.body as unknown as BodyInit, { headers });
		}

		throw error(404, 'Not found');
	};

	const PUT: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		const sub = event.params.path ?? '';
		if (!sub.startsWith('content/')) throw error(404, 'Not found');
		await ensureAuth(cfg, event);
		const key = decodeURIComponent(sub.slice('content/'.length));
		const body = (await event.request.json().catch(() => null)) as { data?: StoredData } | null;
		if (!body || body.data === undefined) throw error(400, 'Missing data');
		await putRecord(cfg.db, key, body.data);
		await cfg.onContentChange?.(key, event);
		return json({ ok: true, key });
	};

	const POST: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		const sub = event.params.path ?? '';
		if (sub !== 'images') throw error(404, 'Not found');
		await ensureAuth(cfg, event);
		const form = await event.request.formData().catch(() => null);
		const file = form?.get('file');
		if (!(file instanceof Blob)) throw error(400, 'Missing file');
		// R2 bucket: wrap it into a store that serves via this route's images/ path.
		const store: ImageStore = isR2Bucket(cfg.images)
			? r2ImageStore(cfg.images, { publicBaseUrl: cfg.imagePublicBase ?? event.url.pathname })
			: cfg.images;
		const { id, url } = await store.put(file);
		await recordImage(cfg.db, id, url);
		return json({ id, url }, { status: 201 });
	};

	return { GET, PUT, POST };
}
