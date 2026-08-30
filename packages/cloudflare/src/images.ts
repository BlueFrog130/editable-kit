import type { R2Bucket } from '@cloudflare/workers-types';

/** Uploads an image blob and returns a stable id + a public URL to serve it. */
export interface ImageStore {
	put(blob: Blob): Promise<{ id: string; url: string }>;
}

/**
 * Store images in an R2 bucket. `publicBaseUrl` is where the bucket is served
 * (an r2.dev URL, a custom domain, or this Worker's own `/images` route).
 */
export function r2ImageStore(bucket: R2Bucket, opts: { publicBaseUrl: string }): ImageStore {
	const base = opts.publicBaseUrl.replace(/\/$/, '');
	return {
		async put(blob) {
			const id = `${crypto.randomUUID()}.webp`;
			await bucket.put(id, await blob.arrayBuffer(), {
				httpMetadata: { contentType: blob.type || 'image/webp' }
			});
			return { id, url: `${base}/${id}` };
		}
	};
}

/**
 * Store images in Cloudflare Images. Needs an account id, an API token with
 * Images write access, and your delivery URL (https://imagedelivery.net/<hash>).
 */
export function cloudflareImagesStore(opts: {
	accountId: string;
	apiToken: string;
	deliveryUrl: string;
	variant?: string;
}): ImageStore {
	const delivery = opts.deliveryUrl.replace(/\/$/, '');
	const variant = opts.variant ?? 'public';
	return {
		async put(blob) {
			const form = new FormData();
			form.append('file', blob, 'image.webp');
			const res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${opts.accountId}/images/v1`,
				{ method: 'POST', headers: { Authorization: `Bearer ${opts.apiToken}` }, body: form }
			);
			if (!res.ok) throw new Error(`Cloudflare Images upload failed: ${res.status}`);
			const json = (await res.json()) as { result: { id: string } };
			const id = json.result.id;
			return { id, url: `${delivery}/${id}/${variant}` };
		}
	};
}
