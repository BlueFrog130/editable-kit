/** Lowercase hex SHA-256 — an asset's key is the hash of its own bytes. */
export async function sha256Hex(bytes: BufferSource): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** A key produced by {@link sha256Hex}. Anything else is not ours. */
export const ASSET_KEY = /^[0-9a-f]{64}$/;
