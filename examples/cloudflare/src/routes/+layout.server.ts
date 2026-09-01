import { error } from '@sveltejs/kit';
import { load as loadContent } from '$lib/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform }) => {
	if (!platform) error(500, 'No Cloudflare platform bindings — run `wrangler dev` or `vite dev`.');
	return { content: await loadContent(platform.env.DB) };
};
