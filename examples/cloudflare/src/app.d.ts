import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				BUCKET: R2Bucket;
				ADMIN_TOKEN?: string;
				DEPLOY_HOOK_URL?: string;
			};
			context: { waitUntil(promise: Promise<unknown>): void };
		}
	}
}

export {};
