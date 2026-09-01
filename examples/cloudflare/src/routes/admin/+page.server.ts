import type { PageServerLoad } from './$types';
import { getRecord } from '@editable-kit/adapter-cloudflare/content';
import { DEFAULT_HOME, HOME_KEY, type HomeContent } from '$lib/content';
import { ADMIN_TOKEN } from '$env/static/private';

export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const record = platform ? await getRecord(platform.env.DB, HOME_KEY) : null;
	// NOTE: protect this route in production (Cloudflare Access, session auth, etc.).
	// The write token is handed to the authenticated admin UI so it can call the API.
	return {
		content: (record?.data as HomeContent) ?? DEFAULT_HOME,
		// Sent back on save, so a save built on a stale page is refused instead of
		// silently overwriting whoever saved in between.
		version: record?.version ?? 0,
		token: ADMIN_TOKEN ?? ''
	};
};
