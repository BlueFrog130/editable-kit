import {
	background,
	bearerAuth,
	contentRoutes,
	deployHook,
	fromSvelteKit,
	HttpError
} from '@editable-kit/adapter-cloudflare/routes';
import { maybeSweepAssets } from '@editable-kit/adapter-cloudflare/gc';
import type { RequestHandler } from './$types';

// The consumer wires their own bindings (named however they like) into the API.
const content = contentRoutes<App.Platform['env']>((_request, ctx) => {
	const env = ctx.env;
	if (!env) throw new HttpError(500, 'No platform env — run via adapter-cloudflare / wrangler.');
	const rebuild = deployHook<App.Platform['env']>(env.DEPLOY_HOOK_URL);
	return {
		db: env.DB,
		authorize: bearerAuth(env.ADMIN_TOKEN),
		onContentChange: (key, request, c) => {
			rebuild?.(key, request, c);
			// No Cron Trigger on Pages, so cleanup rides along with editing: at most one
			// sweep a day, after the response. On Workers, use a `scheduled` handler instead.
			background(c, maybeSweepAssets(env.DB, env.BUCKET));
		}
	};
});

export const GET: RequestHandler = (event) => content.GET(event.request, fromSvelteKit(event));
export const PUT: RequestHandler = (event) => content.PUT(event.request, fromSvelteKit(event));
export const DELETE: RequestHandler = (event) =>
	content.DELETE(event.request, fromSvelteKit(event));
