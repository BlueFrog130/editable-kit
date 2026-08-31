import type { R2Bucket, R2GetOptions } from '@cloudflare/workers-types';

export { ASSET_KEY, sha256Hex } from './hash.js';

type R2RangeParts = { offset?: number; length?: number; suffix?: number };

/** Body shapes R2 accepts — a stream included, so uploads never need buffering. */
export type AssetBody = Parameters<R2Bucket['put']>[1];

/**
 * Types served back with their own content-type. SVG is deliberately absent: served
 * same-origin it is a script host, and these assets share the app's origin by default.
 */
export const DEFAULT_TYPES: readonly string[] = [
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
	'image/avif'
];

/** Assets are content-addressed, so a key's bytes never change. */
export const IMMUTABLE = 'public, max-age=31536000, immutable';

/**
 * Store bytes under their own SHA-256. R2 verifies the checksum, so a client that
 * lies about the hash is rejected rather than poisoning the key space.
 *
 * An existing key is already the right bytes — nothing is uploaded, which is what
 * makes retries and re-picking the same file free.
 */
export async function putAsset(
	bucket: R2Bucket,
	key: string,
	body: AssetBody,
	opts: { contentType?: string; cacheControl?: string } = {}
): Promise<{ key: string; deduped: boolean }> {
	if (await bucket.head(key)) return { key, deduped: true };
	await bucket.put(key, body, {
		sha256: key,
		httpMetadata: {
			contentType: opts.contentType || 'application/octet-stream',
			cacheControl: opts.cacheControl ?? IMMUTABLE
		}
	});
	return { key, deduped: false };
}

/**
 * Serve an asset from R2, handing R2 the request's own conditional and range headers:
 * a repeat view costs a 304 with no body, and a range request gets a 206.
 *
 * In production, prefer an R2 custom domain over this route — then the bytes never
 * touch a Worker at all and this stays the local-dev path.
 */
export async function serveAsset(
	bucket: R2Bucket,
	key: string,
	request: Request,
	opts: { allowedTypes?: readonly string[] } = {}
): Promise<Response> {
	// The request's own headers are the conditional and range options R2 accepts, but they
	// are DOM Headers here and workers-types Headers there.
	const object = await bucket.get(key, {
		onlyIf: request.headers as unknown as R2GetOptions['onlyIf'],
		range: request.headers as unknown as R2GetOptions['range']
	});
	if (!object) return new Response(null, { status: 404 });

	const headers = new Headers();
	object.writeHttpMetadata(headers as unknown as Parameters<typeof object.writeHttpMetadata>[0]);
	// The stored type is attacker-influenced (whoever uploaded), so it only survives if
	// it is on the allowlist; everything else downloads as bytes.
	const allowed = opts.allowedTypes ?? DEFAULT_TYPES;
	const type = headers.get('content-type') ?? '';
	headers.set('content-type', allowed.includes(type) ? type : 'application/octet-stream');
	headers.set('cache-control', IMMUTABLE);
	headers.set('x-content-type-options', 'nosniff');
	headers.set('content-security-policy', "sandbox; default-src 'none'");
	headers.set('accept-ranges', 'bytes');
	headers.set('etag', object.httpEtag);

	// No body means a precondition failed: unchanged for a cache validator, refused otherwise.
	if (!('body' in object))
		return new Response(null, { status: request.headers.has('if-none-match') ? 304 : 412 });

	const range = object.range;
	if (range && request.headers.has('range')) {
		// R2 hands back every key of the union, undefined where it does not apply, so read
		// the values rather than testing which keys exist.
		const { offset: from, length: size, suffix } = range as R2RangeParts;
		const offset = suffix === undefined ? (from ?? 0) : object.size - suffix;
		const length = suffix ?? size ?? object.size - offset;
		headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
		return new Response(object.body as unknown as BodyInit, { status: 206, headers });
	}
	return new Response(object.body as unknown as BodyInit, { headers });
}
