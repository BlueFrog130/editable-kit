import type { UploadHandler } from 'editable-kit';

export interface SaveToApiOptions {
	/** Base URL of the content API, e.g. '/api'. */
	baseUrl: string;
	/** Bearer token sent on writes. */
	token?: string;
	/** Override fetch (tests / SSR). */
	fetch?: typeof fetch;
}

/**
 * Build an `upload` handler for `Editable.Root`. Images are uploaded when the user
 * picks them, so by save time every field already holds a URL.
 *
 * ```svelte
 * <Editable.Root bind:data {editing} upload={uploadToApi({ baseUrl: '/api', token })}>
 * ```
 */
export function uploadToApi(opts: {
	baseUrl: string;
	token?: string;
	fetch?: typeof fetch;
}): UploadHandler {
	const doFetch = opts.fetch ?? fetch;
	const base = opts.baseUrl.replace(/\/$/, '');
	const headers: Record<string, string> = opts.token
		? { authorization: `Bearer ${opts.token}` }
		: {};

	return async function upload(file: File): Promise<string> {
		const form = new FormData();
		form.append('file', file, file.name || 'image');
		const res = await doFetch(`${base}/images`, { method: 'POST', headers, body: form });
		if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
		return ((await res.json()) as { url: string }).url;
	};
}

/**
 * Store the object you bound to `Editable.Root` under a record key. `onsave` hands you
 * a plain snapshot of it, so there is nothing to unwrap.
 *
 * ```svelte
 * <Editable.Root bind:data {editing} onsave={(saved) => save('home', saved)}>
 * ```
 */
export function saveToApi(opts: SaveToApiOptions): (key: string, data: unknown) => Promise<void> {
	const doFetch = opts.fetch ?? fetch;
	const base = opts.baseUrl.replace(/\/$/, '');
	const headers: Record<string, string> = {
		'content-type': 'application/json',
		...(opts.token ? { authorization: `Bearer ${opts.token}` } : {})
	};

	return async function save(key: string, data: unknown): Promise<void> {
		const res = await doFetch(`${base}/content/${encodeURIComponent(key)}`, {
			method: 'PUT',
			headers,
			body: JSON.stringify({ data })
		});
		if (!res.ok) throw new Error(`Save failed for ${key}: ${res.status}`);
	};
}

/** Fetch a stored record's data. Returns null on 404. */
export async function loadFromApi<T = unknown>(
	baseUrl: string,
	key: string,
	init?: { fetch?: typeof fetch }
): Promise<T | null> {
	const doFetch = init?.fetch ?? fetch;
	const res = await doFetch(`${baseUrl.replace(/\/$/, '')}/content/${encodeURIComponent(key)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`Load failed: ${res.status}`);
	return ((await res.json()) as { data: T }).data;
}
