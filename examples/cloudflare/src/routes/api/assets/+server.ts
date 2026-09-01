import { error, json } from '@sveltejs/kit';
import { authorized } from '$lib/content';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	if (!platform) error(500, 'No platform bindings');
	if (!authorized(request, platform.env.ADMIN_TOKEN)) error(401, 'Unauthorized');

	const file = (await request.formData()).get('file');
	if (!(file instanceof File)) error(400, 'Expected a file');
	if (!file.type.startsWith('image/')) error(415, 'Expected an image');
	if (file.size > 10_000_000) error(413, 'Max 10MB');

	// Content-addressed: the same image uploaded twice overwrites itself instead of
	// leaking a second copy. ponytail: no orphan sweeper — deleting a field leaves its
	// bytes in R2. Add an R2 lifecycle rule or a sweep job if that ever costs anything.
	const bytes = await file.arrayBuffer();
	const digest = await crypto.subtle.digest('SHA-256', bytes);
	const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
	const key = `assets/${hash}`;

	await platform.env.BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type } });
	return json({ url: `/api/assets/${hash}` });
};
