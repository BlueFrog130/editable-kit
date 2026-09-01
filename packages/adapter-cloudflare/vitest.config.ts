import { defineConfig } from 'vitest/config';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';

// Real D1 + R2 in workerd. The sweeper's correctness is about how R2 listing and D1 rows
// interact, which a hand-written fake would only pretend to test.
export default defineConfig({
	plugins: [
		cloudflareTest(async () => ({
			miniflare: {
				compatibilityDate: '2026-07-05',
				compatibilityFlags: ['nodejs_compat'],
				d1Databases: { DB: 'test' },
				r2Buckets: ['BUCKET'],
				bindings: { MIGRATIONS: await readD1Migrations('./migrations') }
			}
		}))
	],
	test: { setupFiles: ['./src/test-setup.ts'] }
});
