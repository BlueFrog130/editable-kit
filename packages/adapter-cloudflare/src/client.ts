import { sha256Hex } from './hash.js';

export interface ClientOptions {
	/** Where the asset route is mounted. Default '/assets'. */
	assetBase?: string;
	/** Where the content route is mounted. Default '/api/content'. */
	contentBase?: string;
	/** Bearer token sent on writes. Omit when the route authorizes by session. */
	token?: string;
	/** Override fetch (tests / SSR). */
	fetch?: typeof fetch;
}

/**
 * Upload a picked file and return the path to put in the record.
 *
 * The file is named by its own SHA-256, so picking the same file twice — or the same
 * file someone else already uploaded — transfers nothing and yields the same path.
 * Uploading is not a commitment: an asset nothing saves a reference to is swept later.
 *
 * ```ts
 * const src = await uploadAsset(file, { token });
 * state?.run((e) => e.chain().focus().setImage({ src }).run());
 * ```
 */
export async function uploadAsset(file: Blob, opts: ClientOptions = {}): Promise<string> {
	const doFetch = opts.fetch ?? fetch;
	const base = (opts.assetBase ?? '/assets').replace(/\/$/, '');
	const bytes = await file.arrayBuffer();
	const key = await sha256Hex(bytes);

	const res = await doFetch(`${base}/${key}`, {
		method: 'PUT',
		headers: {
			'content-type': file.type || 'application/octet-stream',
			...(opts.token ? { authorization: `Bearer ${opts.token}` } : {})
		},
		body: bytes
	});
	if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
	return `${base}/${key}`;
}

/**
 * Save the object you bound to `Editable.Root` under a record key. `onsave` hands you a
 * plain snapshot of it, so there is nothing to unwrap — and every asset in it is already
 * a path, so this is a small JSON request whatever the images weigh.
 *
 * Pass the `version` you loaded to be told (409) rather than silently overwrite someone
 * else's save. The new version comes back for the next write.
 */
export function saveToApi(
	opts: ClientOptions = {}
): (key: string, data: unknown, version?: number) => Promise<number> {
	const doFetch = opts.fetch ?? fetch;
	const base = (opts.contentBase ?? '/api/content').replace(/\/$/, '');

	return async function save(key: string, data: unknown, version?: number): Promise<number> {
		const res = await doFetch(`${base}/${encodeURIComponent(key)}`, {
			method: 'PUT',
			headers: {
				'content-type': 'application/json',
				...(version === undefined ? {} : { 'if-match': String(version) }),
				...(opts.token ? { authorization: `Bearer ${opts.token}` } : {})
			},
			body: JSON.stringify({ data })
		});
		if (res.status === 409) throw new Error('This page changed since you opened it — reload.');
		if (!res.ok) throw new Error(`Save failed for ${key}: ${res.status}`);
		return ((await res.json()) as { version: number }).version;
	};
}

/** Fetch a stored record. Returns null on 404. */
export async function loadFromApi<T = unknown>(
	key: string,
	opts: ClientOptions = {}
): Promise<{ data: T; version: number } | null> {
	const doFetch = opts.fetch ?? fetch;
	const base = (opts.contentBase ?? '/api/content').replace(/\/$/, '');
	const res = await doFetch(`${base}/${encodeURIComponent(key)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`Load failed: ${res.status}`);
	return (await res.json()) as { data: T; version: number };
}
