import {
	assetRoutes,
	bearerAuth,
	fromSvelteKit,
	HttpError
} from '@editable-kit/adapter-cloudflare/routes';
import type { RequestHandler } from './$types';

// Assets are named by their own SHA-256, so this route is content-addressed: GET is
// immutable and cacheable forever, PUT is idempotent. In production, point an R2 custom
// domain at this path instead and the bytes never touch a Worker.
const asset = assetRoutes<App.Platform['env']>((_request, ctx) => {
	const env = ctx.env;
	if (!env) throw new HttpError(500, 'No platform env — run via adapter-cloudflare / wrangler.');
	return { bucket: env.BUCKET, authorize: bearerAuth(env.ADMIN_TOKEN) };
});

export const GET: RequestHandler = (event) => asset.GET(event.request, fromSvelteKit(event));
export const PUT: RequestHandler = (event) => asset.PUT(event.request, fromSvelteKit(event));
