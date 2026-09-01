import type { D1Database, R2Bucket } from '@cloudflare/workers-types';
import { ASSET_KEY, DEFAULT_TYPES, putAsset, serveAsset, type AssetBody } from './assets.js';
import { deleteRecord, getRecord, putRecord, type StoredData } from './content.js';

/**
 * What a handler is given beyond the `Request`. Every field is optional: a bare Worker
 * passes nothing and the key is read off the URL.
 */
export interface RequestContext<Env = unknown> {
	/** Route params, when the framework parsed them. `key` wins over the URL's last segment. */
	params?: { key?: string };
	/** Run a promise past the response — a Worker's `ctx.waitUntil`. */
	waitUntil?: (promise: Promise<unknown>) => void;
	/**
	 * Your Worker bindings. Nothing here reads it — it is how a resolver reaches the
	 * bindings, which in Workers only exist per request.
	 */
	env?: Env;
}

/** A web-standard handler: give it a `Request`, get a `Response`. */
export type Handler<Env = unknown> = (
	request: Request,
	ctx?: RequestContext<Env>
) => Promise<Response>;

/** Return true to allow a write. Defaults to deny-all. */
export type Authorize<Env = unknown> = (
	request: Request,
	ctx: RequestContext<Env>
) => boolean | Promise<boolean>;

export interface AssetConfig<Env = unknown> {
	/** Your R2 bucket (e.g. `env.WHATEVER_YOU_NAMED_IT`). */
	bucket: R2Bucket;
	authorize?: Authorize<Env>;
	/** Rejected above this, from `content-length`. Default 25 MB. */
	maxBytes?: number;
	/** Content types accepted on upload and served back as-is. Default: raster images. */
	allowedTypes?: readonly string[];
}

export interface ContentConfig<Env = unknown> {
	/** Your D1 database instance. */
	db: D1Database;
	authorize?: Authorize<Env>;
	/** After a successful write — an SSG deploy hook, a cache purge, a sweep. */
	onContentChange?: (
		key: string,
		request: Request,
		ctx: RequestContext<Env>
	) => void | Promise<void>;
}

/** Resolve config per request — this is where you reach into your own `env`. */
export type Resolver<C, Env = unknown> = (
	request: Request,
	ctx: RequestContext<Env>
) => C | Promise<C>;

/** Bearer-token authorizer. Denies if no token is configured. */
export function bearerAuth<Env = unknown>(token: string | undefined): Authorize<Env> {
	return (request) => !!token && request.headers.get('authorization') === `Bearer ${token}`;
}

/** Fire a deploy hook (SSG rebuild) when content changes. */
export function deployHook<Env = unknown>(
	url: string | undefined
): ContentConfig<Env>['onContentChange'] {
	if (!url) return undefined;
	return (_key, _request, ctx) => background(ctx, fetch(url, { method: 'POST' }));
}

/** Run a promise past the response, when the host gave us a `waitUntil` to do it with. */
export function background(ctx: RequestContext<unknown>, promise: Promise<unknown>): void {
	if (ctx.waitUntil) ctx.waitUntil(promise);
	else void promise;
}

/**
 * Adapt a SvelteKit `RequestEvent` to a {@link RequestContext}.
 *
 * ```ts
 * // src/routes/assets/[key]/+server.ts
 * const asset = assetRoutes((_req, ctx) => ({ bucket: ctx.env.BUCKET }));
 * export const GET = (e) => asset.GET(e.request, fromSvelteKit(e));
 * export const PUT = (e) => asset.PUT(e.request, fromSvelteKit(e));
 * ```
 *
 * Structurally typed on purpose — this package does not depend on `@sveltejs/kit`.
 */
export function fromSvelteKit<Env>(event: {
	params: Record<string, string | undefined>;
	platform?: { env?: Env; context?: { waitUntil(promise: Promise<unknown>): void } };
}): RequestContext<Env> {
	const context = event.platform?.context;
	return {
		params: { key: event.params.key },
		env: event.platform?.env,
		waitUntil: context ? (p) => context.waitUntil(p) : undefined
	};
}

/**
 * Handlers for the asset route, mounted wherever you like — the key is the last path
 * segment, an asset's SHA-256.
 *
 *   PUT  -> store the request body under that hash (authorized). R2 verifies the hash.
 *   GET  -> serve it, honouring conditional and range requests.
 */
export function assetRoutes<Env = unknown>(
	resolve: Resolver<AssetConfig<Env>, Env>
): { GET: Handler<Env>; PUT: Handler<Env> } {
	return {
		GET: handler(async (request, ctx) => {
			const cfg = await resolve(request, ctx);
			return serveAsset(cfg.bucket, assetKey(request, ctx), request, {
				allowedTypes: cfg.allowedTypes
			});
		}),

		PUT: handler(async (request, ctx) => {
			const cfg = await resolve(request, ctx);
			await ensureAuth(cfg.authorize, request, ctx);
			const key = assetKey(request, ctx);

			const type = (request.headers.get('content-type') ?? '').split(';')[0].trim();
			const allowed = cfg.allowedTypes ?? DEFAULT_TYPES;
			if (!allowed.includes(type)) throw new HttpError(415, `Unsupported type: ${type || 'none'}`);

			// R2 needs a known length, which is also the cheapest way to refuse an oversized
			// upload: before a byte is read. A client that under-declares gets truncated at the
			// length it claimed, and then fails the hash check below.
			const size = Number(request.headers.get('content-length'));
			if (!Number.isFinite(size) || size <= 0) throw new HttpError(411, 'Content-Length required');
			if (size > (cfg.maxBytes ?? 25 * 1024 * 1024)) throw new HttpError(413, 'Too large');
			if (!request.body) throw new HttpError(400, 'Missing body');

			try {
				const put = await putAsset(cfg.bucket, key, request.body as unknown as AssetBody, {
					contentType: type
				});
				return json(put, { status: put.deduped ? 200 : 201 });
			} catch {
				// The one thing R2 refuses here: bytes that are not what the key claims.
				throw new HttpError(400, 'Body does not match the key hash');
			}
		})
	};
}

/**
 * Handlers for the content route. The key is the last path segment.
 *
 *   GET    -> { data, version, updatedAt }
 *   PUT    -> { data }, optional `If-Match: <version>` (authorized). 409 on a stale version.
 *   DELETE -> drop the record and its asset refs (authorized).
 */
export function contentRoutes<Env = unknown>(
	resolve: Resolver<ContentConfig<Env>, Env>
): { GET: Handler<Env>; PUT: Handler<Env>; DELETE: Handler<Env> } {
	return {
		GET: handler(async (request, ctx) => {
			const cfg = await resolve(request, ctx);
			const record = await getRecord(cfg.db, recordKey(request, ctx));
			if (!record) throw new HttpError(404, 'Not found');
			return json(
				{ data: record.data, version: record.version, updatedAt: record.updatedAt },
				{ headers: { 'cache-control': 'public, max-age=60' } }
			);
		}),

		PUT: handler(async (request, ctx) => {
			const cfg = await resolve(request, ctx);
			await ensureAuth(cfg.authorize, request, ctx);
			const key = recordKey(request, ctx);
			const body = (await request.json().catch(() => null)) as { data?: StoredData } | null;
			if (!body || body.data === undefined) throw new HttpError(400, 'Missing data');

			const ifMatch = request.headers.get('if-match');
			const result = await putRecord(cfg.db, key, body.data, {
				ifMatch: ifMatch ? Number(ifMatch) : undefined
			});
			if (!result.ok) throw new HttpError(409, 'Record changed since you loaded it');

			await cfg.onContentChange?.(key, request, ctx);
			return json({ ok: true, key, version: result.version });
		}),

		DELETE: handler(async (request, ctx) => {
			const cfg = await resolve(request, ctx);
			await ensureAuth(cfg.authorize, request, ctx);
			const key = recordKey(request, ctx);
			await deleteRecord(cfg.db, key);
			await cfg.onContentChange?.(key, request, ctx);
			return json({ ok: true, key });
		})
	};
}

/** A refusal with a status. Thrown anywhere inside a handler; caught by {@link handler}. */
export class HttpError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'HttpError';
	}
}

export function json(body: unknown, init: ResponseInit = {}): Response {
	const headers = new Headers(init.headers);
	headers.set('content-type', 'application/json');
	return new Response(JSON.stringify(body), { ...init, headers });
}

/** Wrap a handler body so a thrown {@link HttpError} becomes its Response. */
function handler<Env>(
	fn: (request: Request, ctx: RequestContext<Env>) => Promise<Response>
): Handler<Env> {
	return async (request, ctx = {}) => {
		try {
			return await fn(request, ctx);
		} catch (e) {
			if (e instanceof HttpError) return json({ message: e.message }, { status: e.status });
			throw e;
		}
	};
}

/** The route's key: what the framework parsed, else the URL's last path segment. */
function segment(request: Request, ctx: RequestContext<unknown>): string {
	const explicit = ctx.params?.key;
	if (explicit !== undefined) return explicit;
	const path = new URL(request.url).pathname;
	return decodeURIComponent(path.slice(path.lastIndexOf('/') + 1));
}

function assetKey(request: Request, ctx: RequestContext<unknown>): string {
	const key = segment(request, ctx);
	if (!ASSET_KEY.test(key)) throw new HttpError(404, 'Not found');
	return key;
}

function recordKey(request: Request, ctx: RequestContext<unknown>): string {
	const key = segment(request, ctx);
	if (!key) throw new HttpError(404, 'Not found');
	return key;
}

async function ensureAuth<Env>(
	authorize: Authorize<Env> | undefined,
	request: Request,
	ctx: RequestContext<Env>
): Promise<void> {
	if (!(authorize ? await authorize(request, ctx) : false)) {
		throw new HttpError(401, 'Unauthorized');
	}
}
