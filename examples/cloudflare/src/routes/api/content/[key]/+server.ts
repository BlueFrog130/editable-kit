import { background, bearerAuth, contentRoutes, deployHook } from '@editable-kit/cloudflare/routes';
import { maybeSweepAssets } from '@editable-kit/cloudflare/gc';
import { error } from '@sveltejs/kit';

// The consumer wires their own bindings (named however they like) into the API.
export const { GET, PUT, DELETE } = contentRoutes((event) => {
	const env = event.platform?.env;
	if (!env) throw error(500, 'No platform env — run via adapter-cloudflare / wrangler.');
	const rebuild = deployHook(env.DEPLOY_HOOK_URL);
	return {
		db: env.DB,
		authorize: bearerAuth(env.ADMIN_TOKEN),
		onContentChange: (key, ev) => {
			rebuild?.(key, ev);
			// No Cron Trigger on Pages, so cleanup rides along with editing: at most one
			// sweep a day, after the response. On Workers, use a `scheduled` handler instead.
			background(ev, maybeSweepAssets(env.DB, env.BUCKET));
		}
	};
});
