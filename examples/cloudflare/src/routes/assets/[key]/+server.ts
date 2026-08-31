import { assetRoutes, bearerAuth } from '@editable-kit/cloudflare/routes';
import { error } from '@sveltejs/kit';

// Assets are named by their own SHA-256, so this route is content-addressed: GET is
// immutable and cacheable forever, PUT is idempotent. In production, point an R2 custom
// domain at this path instead and the bytes never touch a Worker.
export const { GET, PUT } = assetRoutes((event) => {
	const env = event.platform?.env;
	if (!env) throw error(500, 'No platform env — run via adapter-cloudflare / wrangler.');
	return { bucket: env.BUCKET, authorize: bearerAuth(env.ADMIN_TOKEN) };
});
