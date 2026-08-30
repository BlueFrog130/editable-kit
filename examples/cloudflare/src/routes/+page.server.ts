import type { PageServerLoad } from './$types';
import { getRecord } from '@editable-kit/cloudflare/db';
import { DEFAULT_HOME, HOME_KEY, type HomeContent } from '$lib/content';

// Dynamic mode (default): read D1 per request via the binding.
// SSG mode: set `prerender = true` and load from the deployed content API
// (loadFromApi) instead of the binding, then wire DEPLOY_HOOK_URL to rebuild.
export const prerender = false;

export const load: PageServerLoad = async ({ platform }) => {
	const record = platform ? await getRecord(platform.env.DB, HOME_KEY) : null;
	return { content: (record?.data as HomeContent) ?? DEFAULT_HOME };
};
