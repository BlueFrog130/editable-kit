import { applyD1Migrations, env } from 'cloudflare:test';
import type { D1Migration } from '@cloudflare/vitest-pool-workers';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare module 'cloudflare:test' {
	interface ProvidedEnv {
		DB: D1Database;
		BUCKET: R2Bucket;
		MIGRATIONS: D1Migration[];
	}
}

await applyD1Migrations(env.DB, env.MIGRATIONS);
