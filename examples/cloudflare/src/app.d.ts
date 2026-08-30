import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				BUCKET: R2Bucket;
				ADMIN_TOKEN?: string;
				R2_PUBLIC_BASE_URL?: string;
				DEPLOY_HOOK_URL?: string;
				CF_IMAGES_ACCOUNT_ID?: string;
				CF_IMAGES_API_TOKEN?: string;
				CF_IMAGES_DELIVERY_URL?: string;
			};
			context: { waitUntil(promise: Promise<unknown>): void };
		}
	}
}

export {};
