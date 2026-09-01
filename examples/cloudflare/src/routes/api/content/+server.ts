import { error, json } from '@sveltejs/kit';
import { authorized, save } from '$lib/content';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, platform }) => {
	if (!platform) error(500, 'No platform bindings');
	if (!authorized(request, platform.env.ADMIN_TOKEN)) error(401, 'Unauthorized');

	await save(platform.env.DB, await request.json());
	return json({ ok: true });
};
