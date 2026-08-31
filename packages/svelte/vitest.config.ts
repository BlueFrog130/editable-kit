import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'src/**/*.svelte.{test,spec}.ts'],
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		// ponytail: cold vite transform of the lib entry blows the 5s default
		testTimeout: 30000
	}
});
