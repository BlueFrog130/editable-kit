import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform) error(500, 'No platform bindings');

	const obj = await platform.env.BUCKET.get(`assets/${params.key}`);
	if (!obj) error(404, 'Not found');

	return new Response(obj.body as unknown as ReadableStream, {
		headers: {
			'content-type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
			// Keys are content hashes, so the bytes behind one never change.
			'cache-control': 'public, max-age=31536000, immutable',
			etag: obj.httpEtag
		}
	});
};
