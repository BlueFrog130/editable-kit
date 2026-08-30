import { defineConfig } from 'oxlint';

export default defineConfig({
	plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest'],
	categories: { correctness: 'error' },
	rules: {
		// bind:this assigns these; oxlint doesn't see it
		'no-unassigned-vars': 'off',
		// stylistic, 48 hits in existing tests
		'vitest/require-mock-type-parameters': 'off'
	},
	env: { builtin: true, browser: true, es2024: true },
	ignorePatterns: ['**/.svelte-kit/**', '**/dist/**', '**/build/**']
});
