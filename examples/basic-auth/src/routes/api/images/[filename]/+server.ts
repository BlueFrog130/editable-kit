import { error } from '@sveltejs/kit';
import { readImage } from '$lib/server/images';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const data = await readImage(params.filename);
	if (!data) error(404, 'Image not found');

	return new Response(new Uint8Array(data), {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
