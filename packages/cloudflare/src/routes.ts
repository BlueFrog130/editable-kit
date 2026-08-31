import { error, json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { ASSET_KEY, DEFAULT_TYPES, putAsset, serveAsset, type AssetBody } from './assets.js';
import { deleteRecord, getRecord, putRecord, type StoredData } from './content.js';

/** Return true to allow a write. Defaults to deny-all. */
export type Authorize = (event: RequestEvent) => boolean | Promise<boolean>;

export interface AssetConfig {
	/** Your R2 bucket (e.g. `event.platform.env.WHATEVER_YOU_NAMED_IT`). */
	bucket: R2Bucket;
	authorize?: Authorize;
	/** Rejected above this, from `content-length`. Default 25 MB. */
	maxBytes?: number;
	/** Content types accepted on upload and served back as-is. Default: raster images. */
	allowedTypes?: readonly string[];
}

export interface ContentConfig {
	/** Your D1 database instance. */
	db: D1Database;
	authorize?: Authorize;
	/** After a successful write — an SSG deploy hook, a cache purge, a sweep. */
	onContentChange?: (key: string, event: RequestEvent) => void | Promise<void>;
}

/** Bearer-token authorizer. Denies if no token is configured. */
export function bearerAuth(token: string | undefined): Authorize {
	return (event) => !!token && event.request.headers.get('authorization') === `Bearer ${token}`;
}

/** Fire a deploy hook (SSG rebuild) when content changes. */
export function deployHook(url: string | undefined): ContentConfig['onContentChange'] {
	if (!url) return undefined;
	return (_key, event) => background(event, fetch(url, { method: 'POST' }));
}

/** Run a promise past the response — adapter-cloudflare exposes `waitUntil` here. */
export function background(event: RequestEvent, promise: Promise<unknown>): void {
	const ctx = (event.platform as { context?: { waitUntil(p: Promise<unknown>): void } } | undefined)
		?.context;
	if (ctx) ctx.waitUntil(promise);
	else void promise;
}

/**
 * Handlers for `src/routes/assets/[key]/+server.ts`, where `key` is an asset's SHA-256.
 *
 *   PUT  -> store the request body under that hash (authorized). R2 verifies the hash.
 *   GET  -> serve it, honouring conditional and range requests.
 */
export function assetRoutes(resolve: (event: RequestEvent) => AssetConfig | Promise<AssetConfig>): {
	GET: RequestHandler;
	PUT: RequestHandler;
} {
	const GET: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		return serveAsset(cfg.bucket, assetKey(event), event.request, {
			allowedTypes: cfg.allowedTypes
		});
	};

	const PUT: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		await ensureAuth(cfg.authorize, event);
		const key = assetKey(event);

		const type = (event.request.headers.get('content-type') ?? '').split(';')[0].trim();
		const allowed = cfg.allowedTypes ?? DEFAULT_TYPES;
		if (!allowed.includes(type)) throw error(415, `Unsupported type: ${type || 'none'}`);

		// R2 needs a known length, which is also the cheapest way to refuse an oversized
		// upload: before a byte is read. A client that under-declares gets truncated at the
		// length it claimed, and then fails the hash check below.
		const size = Number(event.request.headers.get('content-length'));
		if (!Number.isFinite(size) || size <= 0) throw error(411, 'Content-Length required');
		if (size > (cfg.maxBytes ?? 25 * 1024 * 1024)) throw error(413, 'Too large');
		if (!event.request.body) throw error(400, 'Missing body');

		try {
			const put = await putAsset(cfg.bucket, key, event.request.body as unknown as AssetBody, {
				contentType: type
			});
			return json(put, { status: put.deduped ? 200 : 201 });
		} catch {
			// The one thing R2 refuses here: bytes that are not what the key claims.
			throw error(400, 'Body does not match the key hash');
		}
	};

	return { GET, PUT };
}

/**
 * Handlers for `src/routes/api/content/[key]/+server.ts`.
 *
 *   GET    -> { data, version, updatedAt }
 *   PUT    -> { data }, optional `If-Match: <version>` (authorized). 409 on a stale version.
 *   DELETE -> drop the record and its asset refs (authorized).
 */
export function contentRoutes(
	resolve: (event: RequestEvent) => ContentConfig | Promise<ContentConfig>
): { GET: RequestHandler; PUT: RequestHandler; DELETE: RequestHandler } {
	const GET: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		const record = await getRecord(cfg.db, recordKey(event));
		if (!record) throw error(404, 'Not found');
		return json(
			{ data: record.data, version: record.version, updatedAt: record.updatedAt },
			{ headers: { 'cache-control': 'public, max-age=60' } }
		);
	};

	const PUT: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		await ensureAuth(cfg.authorize, event);
		const key = recordKey(event);
		const body = (await event.request.json().catch(() => null)) as { data?: StoredData } | null;
		if (!body || body.data === undefined) throw error(400, 'Missing data');

		const ifMatch = event.request.headers.get('if-match');
		const result = await putRecord(cfg.db, key, body.data, {
			ifMatch: ifMatch ? Number(ifMatch) : undefined
		});
		if (!result.ok) throw error(409, 'Record changed since you loaded it');

		await cfg.onContentChange?.(key, event);
		return json({ ok: true, key, version: result.version });
	};

	const DELETE: RequestHandler = async (event) => {
		const cfg = await resolve(event);
		await ensureAuth(cfg.authorize, event);
		const key = recordKey(event);
		await deleteRecord(cfg.db, key);
		await cfg.onContentChange?.(key, event);
		return json({ ok: true, key });
	};

	return { GET, PUT, DELETE };
}

function assetKey(event: RequestEvent): string {
	const key = event.params.key ?? '';
	if (!ASSET_KEY.test(key)) throw error(404, 'Not found');
	return key;
}

function recordKey(event: RequestEvent): string {
	const key = event.params.key;
	if (!key) throw error(404, 'Not found');
	return key;
}

async function ensureAuth(authorize: Authorize | undefined, event: RequestEvent): Promise<void> {
	if (!(authorize ? await authorize(event) : false)) throw error(401, 'Unauthorized');
}
