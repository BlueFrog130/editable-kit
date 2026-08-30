import { createContentApi, bearerAuth, deployHook } from '@editable-kit/cloudflare/server';
import { error } from '@sveltejs/kit';

// The consumer wires their own bindings (named however they like) into the API.
export const { GET, PUT, POST } = createContentApi((event) => {
	const env = event.platform?.env;
	if (!env) throw error(500, 'No platform env — run via adapter-cloudflare / wrangler.');
	return {
		db: env.DB,
		// Pass the R2 bucket instance — images are stored and served through /api/images.
		// For Cloudflare Images instead: `images: cloudflareImagesStore({ ... })`.
		images: env.BUCKET,
		authorize: bearerAuth(env.ADMIN_TOKEN),
		onContentChange: deployHook(env.DEPLOY_HOOK_URL)
	};
});
