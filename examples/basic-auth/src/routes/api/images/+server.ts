import { error, json } from '@sveltejs/kit';
import { verifySessionToken, COOKIE_NAME } from '$lib/server/auth';
import { saveImage } from '$lib/server/images';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const token = cookies.get(COOKIE_NAME);
	if (!token || !verifySessionToken(token)) error(401, 'Unauthorized');

	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File)) error(400, 'Expected a file');
	if (!file.type.startsWith('image/')) error(415, 'Expected an image');

	return json({ url: await saveImage(await file.arrayBuffer()) });
};
